import requests
import os
import json
from bs4 import BeautifulSoup

# Define all capital letters in the Finnish language.
finnish_letters = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ") + ["Å", "Ä", "Ö"]

# Optional: Create a directory to store the extracted JSON files.
output_dir = "locales"
os.makedirs(output_dir, exist_ok=True)

domain = "sanat.csc.fi/wiki/Suomen_romanikielen_verkkosanakirja"

for letter in finnish_letters:
    url = f"https://{domain}:{letter}"
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raises an error for bad status codes


        # Parse the HTML and extract dictionary pairs as JSON.
        soup = BeautifulSoup(response.text, "html.parser")
        results = {}
        for p in soup.find_all("p"):
            b = p.find("b")
            if b:
                finnish_word = b.get_text(strip=True)
                ul = p.find_next_sibling("ul")
                if ul:
                    romani_translations = []
                    for li in ul.find_all("li"):
                        i_elem = li.find("i")
                        if i_elem:
                            translation = i_elem.get_text(strip=True)
                            romani_translations.append(translation)
                    if romani_translations:
                        results[finnish_word] = romani_translations

        json_filename = os.path.join(output_dir, f"{letter}.json")
        with open(json_filename, "w", encoding="utf-8") as jf:
            json.dump(results, jf, ensure_ascii=False, indent=2)
        print(f"Extracted {len(results)} entries from letter {letter} into {json_filename}")
    except requests.RequestException as e:
        print(f"Failed to download {url}. Error: {e}")

