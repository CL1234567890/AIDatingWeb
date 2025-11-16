# main.py
import os
import requests
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from openai import OpenAI

# ------------ 加载 .env 中的 key ------------
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

if not OPENAI_API_KEY:
    raise RuntimeError("Missing OPENAI_API_KEY in environment/.env")
if not GOOGLE_MAPS_API_KEY:
    raise RuntimeError("Missing GOOGLE_MAPS_API_KEY in environment/.env")

# OpenAI 客户端
client = OpenAI(api_key=OPENAI_API_KEY)

# ------------ FastAPI app ------------
app = FastAPI(title="AI Date Planner Backend")

# 允许本地前端访问
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 健康检查
@app.get("/health")
async def health_check():
    return {"status": "ok"}


# ------------ Pydantic 模型 ------------

class DatePlanRequest(BaseModel):
    mood: str = Field(..., description="User's current mood")
    budget: str = Field(..., description="low / medium / high")
    indoorOutdoor: str = Field(..., description="indoor / outdoor / either")
    distance: float = Field(..., description="最大距离（km）")
    timeOfDay: str = Field(..., description="morning / afternoon / evening / late-night")

    # User location（可选）
    latitude: Optional[float] = Field(
        None, description="用户当前纬度（可选，不传就用默认城市）"
    )
    longitude: Optional[float] = Field(
        None, description="用户当前经度（可选，不传就用默认城市）"
    )


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


# ------------ OpenAI 相关函数 ------------

def choose_place_types_with_openai(req: DatePlanRequest) -> List[str]:
    """
    用 OpenAI 根据用户输入，选出 2–3 个合适的 Google Places type。
    """
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
        + ". Respond ONLY with a comma-separated list of place types, "
        "no extra words."
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

    # 只保留允许的 type
    filtered = [t for t in types if t in allowed_types]
    if not filtered:
        filtered = ["cafe", "park"]

    return filtered


def build_summary_with_openai(req: DatePlanRequest, places: List[Place]) -> str:
    """
    根据用户心情 + 推荐地点，用 OpenAI 写一小段 summary。
    """
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


# ------------ Google Places 相关函数 ------------

def search_place_with_google(
    place_type: str, lat: float, lng: float, max_distance_km: float
) -> Optional[Place]:
    """
    调用 Google Places Nearby Search API，
    在指定坐标附近找一个指定 type 的地点。
    """
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
    """
    生成 Google Maps 多点路线 URL。
    """
    if not places:
        return ""

    base = "https://www.google.com/maps/dir/?api=1"
    destination = f"{places[-1].lat},{places[-1].lng}"

    if len(places) > 1:
        waypoints = "|".join([f"{p.lat},{p.lng}" for p in places[:-1]])
        return f"{base}&destination={destination}&waypoints={waypoints}"

    return f"{base}&destination={destination}"


# ------------ FastAPI 路由 ------------

@app.post("/api/dates/plan", response_model=DatePlanResponse)
def plan_date(req: DatePlanRequest) -> DatePlanResponse:
    # 默认定位到 Atlanta, GA
    lat = req.latitude or 33.7490
    lng = req.longitude or -84.3880

    # 1. 用 OpenAI 选出合适的 place types
    place_types = choose_place_types_with_openai(req)

    # 2. 用 Google Places 找真实地点
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

    # 3. 用 OpenAI 写 summary
    summary = build_summary_with_openai(req, places)

    # 4. 生成 Google Maps route URL
    route_url = build_route_url(places)

    return DatePlanResponse(summary=summary, locations=places, routeUrl=route_url)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
