from fastapi import APIRouter
import time

router = APIRouter(prefix="/api/templates", tags=["templates"])

templates_db = [
    { "id": 1, "name": "E-commerce Store", "icon": "ShoppingCart", "desc": "Complete storefront with cart, checkout, and product listings.", "color": "from-blue-500 to-cyan-500", "prompt": "Build an e-commerce storefront with a shopping cart, checkout flow, and a product listing page showing various items." },
    { "id": 2, "name": "SaaS Dashboard", "icon": "LayoutTemplate", "desc": "Admin panel with charts, tables, and user management.", "color": "from-purple-500 to-indigo-500", "prompt": "Create a SaaS admin dashboard featuring a sidebar, top navigation, user management table, and analytics charts." },
    { "id": 3, "name": "Social Network", "icon": "Users", "desc": "Feed, profiles, messaging, and notification systems.", "color": "from-pink-500 to-rose-500", "prompt": "Develop a social network interface with a user feed, profile page, messaging widget, and a notifications dropdown." },
    { "id": 4, "name": "Task Manager", "icon": "CheckSquare", "desc": "Kanban boards, lists, and productivity tracking.", "color": "from-emerald-500 to-teal-500", "prompt": "Build a task manager with a kanban board layout, drag-and-drop lists, and a productivity tracking sidebar." },
]

@router.get("/")
async def get_templates():
    time.sleep(0.5)
    return templates_db
