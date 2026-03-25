import urllib.request
import urllib.error
import json

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNzM2Y2NkNi01YmY2LTRiYzctYmRlMC03NTliNDIzMmExODciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiYzllNmRhODEtODIzNi00YTczLWI3OTItZjI5YmM3YzViMDBkIiwiaWF0IjoxNzc0MjcyMzc3fQ.Lql1zxqenrARtvG69nRYx2ubtZlINc0IWlWaynMhKmI"
url = "https://n8n.srv1123427.hstgr.cloud/api/v1/workflows/dN_Y279mkeCMiFr6qWO27"
headers = {
    "X-N8n-Api-Key": token,
    "Content-Type": "application/json"
}

req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode())

robust_code = """try {
  const allPostsNodes = $("Fetch Blog Posts").all();
  let flatPosts = [];
  for (let node of allPostsNodes) {
    let p = node.json;
    if (Array.isArray(p)) {
      flatPosts = flatPosts.concat(p);
    } else if (p && p.data && Array.isArray(p.data)) {
      flatPosts = flatPosts.concat(p.data);
    } else if (p) {
      flatPosts.push(p);
    }
  }

  let finalItems = [];
  const inputArray = $input.all();

  for (let item of inputArray) {
      if (!item || !item.json || typeof item.json !== 'object') {
          continue;
      }

      const inputJson = item.json;
      const step = parseInt(inputJson.property_huidige_stap || '0', 10);
      const post = flatPosts[step];

      if (!post) {
          continue;
      }

      let resultJson = {
          email: inputJson.property_email || '',
          notion_id: inputJson.id || '',
          current_step: step,
          next_step: step + 1
      };

      if (typeof post === 'object' && !Array.isArray(post) && post !== null) {
          Object.assign(resultJson, post);
      } else {
          resultJson.post_data = post;
      }

      finalItems.push({ json: resultJson });
  }

  return finalItems;
} catch (error) {
  console.error("Error in Smart Content Selector:", error);
  // Give back at least an error object so we can debug in n8n UI
  return [{
    json: {
      error: error.message
    }
  }];
}"""

for node in data['nodes']:
    if node['name'] == 'Smart Content Selector':
        node['parameters']['mode'] = 'runOnceForAllItems'
        node['parameters']['jsCode'] = robust_code

payload = {
    "name": data["name"],
    "nodes": data["nodes"],
    "connections": data["connections"],
    "settings": {}
}

req_put = urllib.request.Request(url, data=json.dumps(payload).encode(), headers=headers, method="PUT")
try:
    with urllib.request.urlopen(req_put) as response_put:
        print("Status Code:", response_put.status)
        print("Response:", response_put.read().decode())
except urllib.error.HTTPError as e:
    print("HTTP ERROR:", e.code)
    print(e.read().decode())
