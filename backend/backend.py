from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_caching import Cache
import requests
from bs4 import BeautifulSoup
from aiohttp import web
import re
import logging


# Define flask app and cache
app = Flask(__name__)
CORS(app)
cache = Cache(app, config={'CACHE_TYPE': 'redis', 'CACHE_REDIS_URL': 'redis://localhost:6379/0'})

# Define logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define URLs of Terraform to scrape
PROVIDER_URLS = {
    'aws': 'https://registry.terraform.io/providers/hashicorp/aws/latest/docs',
    'azure': 'https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs',
    'gcp': 'https://registry.terraform.io/providers/hashicorp/google/latest/docs'
}

def scrape_provider_docs(provider):
    base_url = PROVIDER_URLS[provider]
    response = requests.get(base_url)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    resources = {}
    resource_links = soup.find_all('a', class_='nav-link')
    
    for link in resource_links:
        resource_name = link.text.strip()
        if resource_name.startswith(f"{provider}_"):
            resource_url = base_url + link['href']
            resources[resource_name] = {
                'name': resource_name,
                'url': resource_url,
                'options': scrape_resource_options(resource_url)
            }
    
    return resources

def scrape_resource_options(resource_url):
    response = requests.get(resource_url)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    options = {}
    argument_section = soup.find('h2', text=re.compile('Argument Reference'))
    if argument_section:
        for li in argument_section.find_next('ul').find_all('li'):
            option_text = li.text.strip()
            option_parts = option_text.split(' - ', 1)
            if len(option_parts) == 2:
                option_name, option_description = option_parts
                options[option_name.strip()] = option_description.strip()
    
    return options

async def generate_terraform(request):
    data = await request.json()
    provider = data.get('provider')
    resource = data.get('resource')
    options = data.get('options', {})
    
    if not provider or not resource:
        logger.warning(f"Invalid request: provider={provider}, resource:{resource}")
        return web.json_response({"error": "Provider and resource must be specified"}, status=400)
    
    # Validate provider
    if provider not in PROVIDER_URLS:
        return web.json_response({"error": "Invalid provider"}, status=400)
    
    # Validate resource name
    if not re.match(r'^[a-zA-Z0-9_]+$', resource):
        return web.json_response({"error": "Invalid resource name"}, status=400)
    
    # Validate options
    for option, value in options.items():
        if not re.match(r'^[a-zA-Z0-9_]+$', option):
            return web.json_response({"error": f"Invalid option name: {option}"}, status=400)
        if not isinstance(value, (str, int, bool)):
            return web.json_response({"error": f"Invalid value type for option: {option}"}, status=400)
    
    logger.info(f"Generating Terraform code for provider={provider}, resource={resource}")
    code = f"resource \"{resource}\" \"example\" {{\n"
    for option, value in options.items():
        if value:  # Only include selected options
            code += f"  {option} = \"{value}\"\n"
    code += "}\n"

    
    return web.json_response({"terraform": code})

@app.route('/api/resources', methods=['GET'])
@cache.cached(timeout=3600)  # Cache for 1 hour
def get_resources():
    try:
        all_resources = {}
        for provider in PROVIDER_URLS.keys():
            all_resources[provider] = scrape_provider_docs(provider)
        return jsonify(all_resources)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate', methods=['POST'])
def generate_terraform():
    data = request.json
    provider = data.get('provider')
    resource = data.get('resource')
    options = data.get('options', {})
    
    if not provider or not resource:
        return jsonify({"error": "Provider and resource must be specified"}), 400
    
    code = f"resource \"{resource}\" \"example\" {{\n"
    for option, value in options.items():
        if value:  # Only include selected options
            code += f"  {option} = \"placeholder_value\"\n"
    code += "}\n"
    
    return jsonify({"terraform": code})

if __name__ == '__main__':
    app.run(debug=False)