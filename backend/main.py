import os
import numpy as np
import librosa
import cv2
import tensorflow as tf
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = tf.keras.models.load_model("amharic_voice_model2.h5")

def audio_to_spectrogram(file_bytes, target_width=350):
    audio, sr = librosa.load(io.BytesIO(file_bytes), sr=16000)
    mel_spec = librosa.feature.melspectrogram(y=audio, sr=sr, n_mels=128, fmax=8000)
    log_mel = librosa.power_to_db(mel_spec)
    log_mel = (log_mel - np.min(log_mel)) / (np.max(log_mel) - np.min(log_mel) + 1e-6)
    log_mel = (log_mel * 255).astype(np.uint8)
    current_width = log_mel.shape[1]
    if current_width < target_width:
        pad_width = target_width - current_width
        log_mel = np.pad(log_mel, ((0, 0), (0, pad_width)), mode='constant', constant_values=0)
    elif current_width > target_width:
        log_mel = log_mel[:, :target_width]
    img_rgb = np.stack([log_mel, log_mel, log_mel], axis=-1)
    return img_rgb.astype('float32') / 255.0
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    img = audio_to_spectrogram(contents)
    img = np.expand_dims(img, axis=0)
    
    predictions = model.predict(img)
    gender_prob = predictions[0][0][0]
    speaker_probs = predictions[1][0]
    
    gender = "Male" if gender_prob < 0.5 else "Female"
    speaker_id = int(np.argmax(speaker_probs)) + 1
    
    return {
        "gender": gender,
        "speaker": f"Speaker {speaker_id}",
        "gender_confidence": float(gender_prob),
        "speaker_confidence": float(np.max(speaker_probs))
    }