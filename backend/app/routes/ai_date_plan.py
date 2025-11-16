# app/routes/ai_date_plan.py
import os
import requests
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from openai import OpenAI
# from app.utils.auth import get_current_user

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

if not OPENAI_API_KEY:
    raise RuntimeError("Missing OPENAI_API_KEY in .env")
if not GOOGLE_MAPS_API_KEY:
    raise RuntimeError("Missing GOOGLE_MAPS_API_KEY in .env")

client = OpenAI(api_key=OPENAI_API_KEY)

router = APIRouter(
    prefix="/ai",
    tags=["ai-date-plan"],
)

# ---------- Pydantic models ----------

class DatePlanRequest(BaseModel):
    mood: str = Field(..., description="User's current mood")
    budget: str = Field(..., description="low / medium / high")
    indoorOutdoor: str = Field(..., description="indoor / outdoor / either")
    distance: float = Field(..., description="最大距离（km）")
    timeOfDay: str = Field(..., description="morning / afternoon / evening / late-night")
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


# ---------- OpenAI helpers ----------

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
        "You are an assistant that designs real-life date ideas. "
        "Given the user's mood, budget, indoor/outdoor preference, "
        "max distance and time of day, pick 2 or 3 suitable Google "
        "Places types from this list only: "
        + ", ".join(allowed_types)
        + ". Respond ONLY with a comma-separated list of place types."
    )

    user_prompt = (
        f"Mood: {req.mood}\n"
        f"Budget: {req.budget}\n"
        f"Indoor/Outdoor: {req.indoorOutdoor}\n"
        f"Max distance (km): {req.distance}\n"
        f"Time of day: {req.timeOfDay}"
    )

    completion = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.5,
    )

    content = completion.choices[0].message.content.strip()
    types = [t.strip() for t in content.split(",") if t.strip()]

    filtered = [t for t in types if t in allowed_types]
    if not filtered:
        filtered = ["cafe", "park"]

    return filtered


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
            {"role": "system", "content": "You write warm and concise dating suggestions."},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.7,
    )

    return completion.choices[0].message.content.strip()


# ---------- Google Places helpers ----------

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

    data = resp.json()
    results = data.get("results", [])
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


def build_route_url(places: List[Place]) -> str:
    if not places:
        return ""

    base = "https://www.google.com/maps/dir/?api=1"
    destination = f"{places[-1].lat},{places[-1].lng}"

    if len(places) > 1:
        waypoints = "|".join(f"{p.lat},{p.lng}" for p in places[:-1])
        return f"{base}&destination={destination}&waypoints={waypoints}"

    return f"{base}&destination={destination}"



@router.post("/dates/plan", response_model=DatePlanResponse)
async def plan_date(
    req: DatePlanRequest,
    # user: dict = Depends(get_current_user),
) -> DatePlanResponse:
    # 默认城市：Atlanta
    lat = req.latitude or 33.7490
    lng = req.longitude or -84.3880

    place_types = choose_place_types_with_openai(req)

    places: List[Place] = []
    for t in place_types:
        place = search_place_with_google(t, lat, lng, req.distance)
        if place:
            places.append(place)

    if not places:
        raise HTTPException(
            status_code=500,
            detail="Could not find suitable places nearby. Try increasing distance or changing preferences.",
        )

    summary = build_summary_with_openai(req, places)
    route_url = build_route_url(places)

    return DatePlanResponse(summary=summary, locations=places, routeUrl=route_url)
