# Araç Gövde Tipi Sınıflandırma

Bir araç fotoğrafını sekiz gövde tipinden biri olarak sınıflandıran uçtan uca yapay zekâ uygulaması. FastAPI servisi EfficientNet-B0 modelini çalıştırır; React arayüzü görsel yükleme ve tahmin sonucunu sunar.

## Sınıflar

`AÇIK TEKERLEKLİ`, `HATCHBACK`, `MICRO`, `PICK-UP`, `SEDAN`, `STATION VAGON`, `SUV` ve `VAN`.

## Teknolojiler

- Python, FastAPI, PyTorch ve Torchvision
- EfficientNet-B0 tabanlı görüntü sınıflandırma
- React ve Axios

## Kurulum

### Backend

```bash
cd Backend
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload
```

Model ağırlığı `Backend/araba_modeli_best.pth` konumunda bulunmalıdır. API belgeleri backend çalışırken `http://localhost:8000/docs` adresindedir.

### Frontend

```bash
cd frontend
npm install
npm start
```

## API

- `GET /`: servis durumunu döndürür.
- `POST /predict`: multipart form içindeki `file` alanından görsel alır; sınıf ve güven skorunu döndürür.

## Proje Yapısı

```text
Backend/   FastAPI servisi, model ve çıkarım kodu
frontend/  React kullanıcı arayüzü
```

> Bu proje eğitim ve portföy amaçlıdır. Tahmin sonuçları gerçek dünyadaki kritik kararlar için tek başına kullanılmamalıdır.
