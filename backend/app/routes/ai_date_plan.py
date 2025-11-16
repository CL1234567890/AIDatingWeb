# app/routes/ai_date_plan.py

import os
import json
import requests
from typing import List, Optional

from fastapi import APIRouter, HTTPException  # Removed Depends for now
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from openai import OpenAI
# from app.utils.auth import get_current_user   # can be re-enabled later

load_dotenv()

# ========= Load Keys =========
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

if not OPENAI_API_KEY:
    raise RuntimeError("Missing OPENAI_API_KEY in .env")
if not GOOGLE_MAPS_API_KEY:
    raise RuntimeError("Missing GOOGLE_MAPS_API_KEY in .env")

client = OpenAI(api_key=OPENAI_API_KEY)

router = APIRouter(
    prefix="/api/ai",
    tags=["ai-date-plan"],
)

# ========= Pydantic Models =========

class DatePlanRequest(BaseModel):
    mood: str
    budget: str
    indoorOutdoor: str
    distance: float
    timeOfDay: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class Place(BaseModel):
    name: str
    address: str
    type: str
    lat: float
    lng: float


class DatePlanResponse(BaseModel):
    summary: str
    locations: List[Place]
    routeUrl: Optional[str] = None


# ========= OpenAI Helpers (JSON OUTPUT VERSION) =========

def choose_place_types_with_openai(req: DatePlanRequest) -> List[str]:
    allowed_types = [
        "cafe",
        "bar",
        "restaurant",
        "park",
        "movie_theater",
        "museum",
        "tourist_attraction",
    ]

    system_prompt = (
        "You are an assistant that selects suitable Google Places types for a date.\n"
        "Return ONLY a JSON object in this exact structure:\n"
        "{ \"types\": [\"cafe\", \"park\"] }\n\n"
        "Rules:\n"
        "- The list MUST contain 2 or 3 items.\n"
        "- Each type MUST be one of: "
        + ", ".join(allowed_types)
        + "\n"
        "- No comments, no explanations, no additional fields.\n"
        "- The output MUST be valid JSON."
    )

    user_prompt = (
        f"Mood: {req.mood}\n"
        f"Budget: {req.budget}\n"
        f"Indoor/Outdoor: {req.indoorOutdoor}\n"
        f"Max distance (km): {req.distance}\n"
        f"Time: {req.timeOfDay}"
    )

    completion = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.3,
    )

    data = json.loads(completion.choices[0].message.content)

    types = data.get("types", [])

    # Safety filter
    types = [t for t in types if t in allowed_types]

    if not types:
        types = ["cafe", "park"]

    return types


# ========= Summary Generator =========

def build_summary_with_openai(req: DatePlanRequest, places: List[Place]) -> str:
    places_desc = "\n".join(
        [f"- {p.name} ({p.type}) at {p.address}" for p in places]
    )

    user_prompt = (
        "Create a short, friendly date plan description (2–4 sentences). "
        "Explain why these places match the user's mood and preferences.\n\n"
        f"User mood: {req.mood}\n"
        f"Budget: {req.budget}\n"
        f"Indoor/Outdoor: {req.indoorOutdoor}\n"
        f"Time of day: {req.timeOfDay}\n\n"
        f"Selected places:\n{places_desc}"
    )

    completion = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "system",
                "content": "You write warm and concise romantic date suggestions.",
            },
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.7,
    )

    return completion.choices[0].message.content.strip()


# ========= Google Places Helpers =========

def search_place_with_google(
    place_type: str,
    lat: float,
    lng: float,
    max_distance_km: float,
) -> Optional[Place]:

    radius_m = int(max_distance_km * 1000)

    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "key": GOOGLE_MAPS_API_KEY,
        "location": f"{lat},{lng}",
        "radius": radius_m,
        "type": place_type,
        "opennow": "true",
    }

    resp = requests.get(url, params=params, timeout=10)

    if resp.status_code != 200:
        raise HTTPException(status_code=500, detail="Google Places API error")

    results = resp.json().get("results", [])
    if not results:
        return None

    r0 = results[0]
    name = r0.get("name", "Unknown place")
    address = r0.get("vicinity") or r0.get("formatted_address", "Unknown address")
    loc = r0["geometry"]["location"]

    return Place(
        name=name,
        address=address,
        type=place_type,
        lat=loc["lat"],
        lng=loc["lng"],
    )


# ========= Build Route URL =========

def build_route_url(places: List[Place]) -> str:
    if not places:
        return ""

    base = "https://www.google.com/maps/dir/?api=1"
    last = places[-1]
    destination = f"{last.lat},{last.lng}"

    if len(places) > 1:
        waypoints = "|".join([f"{p.lat},{p.lng}" for p in places[:-1]])
        return f"{base}&destination={destination}&waypoints={waypoints}"

    return f"{base}&destination={destination}"


# ========= Main Planning Endpoint =========

@router.post("/dates/plan", response_model=DatePlanResponse)
async def plan_date(req: DatePlanRequest):
    # Default coordinates: Atlanta
    lat = req.latitude or 33.7490
    lng = req.longitude or -84.3880

    # Step 1: choose place types via OpenAI
    types = choose_place_types_with_openai(req)

    # Step 2: find places with Google
    places: List[Place] = []
    for t in types:
        p = search_place_with_google(t, lat, lng, req.distance)
        if p:
            places.append(p)

    if not places:
        raise HTTPException(
            status_code=500,
            detail="No suitable places found nearby. Try adjusting filters.",
        )

    # Step 3: generate human-friendly summary
    summary = build_summary_with_openai(req, places)

    # Step 4: generate route link
    route_url = build_route_url(places)

    return DatePlanResponse(summary=summary, locations=places, routeUrl=route_url)
