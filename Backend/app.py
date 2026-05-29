import io
import torch
import torch.nn as nn
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from torchvision import models, transforms
from PIL import Image

app = FastAPI(title="Yazlab 2 Proje 3 - Yapay Zeka API")

# --- CORS AYARI ---
# --- CORS AYARI (DÜZELTİLDİ) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],  
)

# --- SINIF LİSTESİ (SENİN VERİ SETİNE GÖRE GÜNCELLENDİ) ---
CLASS_NAMES = ['ACIK_TEKERLEKLI', 'HATCHBACK', 'MICRO', 'PICK_UP', 'SEDAN', 'STATION_VAGON', 'SUV', 'VAN']

# --- MODELİ YÜKLEME ---
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Model mimarisini kuruyoruz
model = models.efficientnet_b0(weights=None)
model.classifier[1] = nn.Linear(model.classifier[1].in_features, len(CLASS_NAMES))

MODEL_PATH = "araba_modeli_best.pth"
try:
    model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
    model = model.to(device)
    model.eval()
    print(f"✅ Model başarıyla yüklendi! Çalıştığı cihaz: {device}")
except Exception as e:
    print(f"❌ Model yüklenirken hata oluştu: {e}")

# --- ENFERANS TRANSFORMLARI ---
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

@app.get("/")
def home():
    return {"status": "Backend Çalışıyor", "message": "Yazlab Proje 3 API sistemine hoş geldiniz."}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        input_tensor = transform(image).unsqueeze(0).to(device)
        
        with torch.no_grad():
            outputs = model(input_tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
            confidence, class_idx = torch.max(probabilities, dim=0)
            
        predicted_class = CLASS_NAMES[class_idx.item()]
        confidence_score = confidence.item() * 100
        
        return {
            "success": True,
            "class": predicted_class,
            "confidence": f"{confidence_score:.2f}"
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}