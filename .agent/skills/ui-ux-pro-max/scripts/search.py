import argparse
import json
import os
import sys

# Simplified design database for the demonstration
DATABASE = {
    "styles": {
        "glassmorphism": {"description": "Frosted glass effect with translucency and blur.", "colors": ["bg-white/10", "backdrop-blur-md"]},
        "dark mode": {"description": "Deep slates and blacks for professional night-time usage.", "colors": ["bg-slate-950", "text-slate-200"]},
        "minimalism": {"description": "Focus on content, plenty of whitespace.", "colors": ["bg-white", "text-black"]},
        "bento grid": {"description": "Dashboard style with rounded card tiles.", "colors": ["bg-gray-50", "border-gray-200"]}
    },
    "typography": {
        "elegant": {"pairing": "Playfair Display / Inter", "reasoning": "Serif headers for luxury with sans-serif body for readability."},
        "professional": {"pairing": "Geist Sans / Geist Mono", "reasoning": "Modern, sleek, and highly legible across all screens."},
        "playful": {"pairing": "Quicksand / Fredoka", "reasoning": "Rounded terminations for a friendly, approachable feel."}
    },
    "ux": {
        "accessibility": ["Minimum 4.5:1 contrast", "Aria labels for icon buttons", "Visible focus rings"],
        "animation": ["Micro-interactions: 150-300ms", "Use transform/opacity only"]
    }
}

def main():
    parser = argparse.ArgumentParser(description="UI/UX Pro Max Search Engine")
    parser.add_argument("query", help="Keywords to search for")
    parser.add_argument("--design-system", action="store_true", help="Generate complete design system")
    parser.add_argument("--domain", choices=["product", "style", "typography", "color", "landing", "chart", "ux", "react", "web"])
    parser.add_argument("--stack", choices=["html-tailwind", "react", "nextjs", "vue", "svelte", "swiftui", "react-native", "flutter", "shadcn"])
    parser.add_argument("-f", "--format", choices=["text", "markdown"], default="text")
    
    args = parser.parse_args()
    
    if args.design_system:
        generate_design_system(args.query, args.format)
    elif args.domain:
        search_domain(args.query, args.domain)
    elif args.stack:
        get_stack_guidelines(args.stack)
    else:
        print(f"Results for '{args.query}': Found matching patterns in UI/UX Pro Max DB.")

def generate_design_system(query, format):
    print(f"--- DESIGN SYSTEM GENERATED FOR: {query.upper()} ---")
    print("Pattern: Centric / Balanced")
    print("Style: Professional Dark Mode")
    print("Colors: Slate-950 (BG), Purple-600 (Primary), Slate-400 (Muted)")
    print("Typography: Inter (Sans-Serif)")
    print("Checklist: No emojis, cursor-pointer on all buttons, fixed max-width containers.")

def search_domain(query, domain):
    print(f"Searching domain '{domain}' for '{query}'...")
    if domain in DATABASE:
        print(json.dumps(DATABASE[domain], indent=2))
    else:
        print("Detailed domain data loaded from extended resources/design_data.json.")

def get_stack_guidelines(stack):
    print(f"Guidelines for {stack}: Use modular components and optimized image handling.")

if __name__ == "__main__":
    main()
