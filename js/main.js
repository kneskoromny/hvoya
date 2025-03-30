import '../css/style.css'
import { db } from '../js/firebase.js';
import { ref, get } from 'firebase/database'
import { ref as storageRef, getDownloadURL, listAll } from "firebase/storage";
import { storage } from "../js/firebase.js";

const modelsRef = ref(db, "models");
const fabricsRef = ref(db, "fabrics");
const colorsRef = ref(db, "colors");

let modelsData = {};
let fabricsData = {};
let colorsData = {};

const loader = document.getElementById("page-loader");
const contentContainer = document.getElementById("content-container");
const modelList = document.getElementById("model-list");

/* Загрузка Моделей */
const fetchData = async () => {
    try {
        const [
          modelsSnap,
          fabricsSnap,
          colorsSnap
        ] = await Promise.all([
            get(modelsRef),
            get(fabricsRef),
            get(colorsRef)
        ])
        if (modelsSnap.exists()) {
          modelsData = modelsSnap.val()
          console.log('Success upload models: ')
        }
        if (fabricsSnap.exists()) {
          fabricsData = fabricsSnap.val()
          console.log('Success upload fabrics: ')
        }
        if (colorsSnap.exists()) {
          colorsData = colorsSnap.val()
          console.log('Success upload colors: ')
        }
        renderModels(modelsData);
        loader.style.display = 'none';
        contentContainer.style.display = 'block';
    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        loader.textContent = "Ошибка загрузки данных 😕";
    }
}

const renderModels = (models) => {
  modelList.innerHTML = ''; 
  modelList.style.display = 'flex';

  Object.keys(models).forEach((key) => {
    const model = models[key];

    const modelCard = document.createElement('div');
    modelCard.classList.add('product-card');
    modelCard.setAttribute('data-key', key); // Добавляем атрибут для поиска

    modelCard.innerHTML = `
    <div class="product-image">
        <img src="../assets/loader.gif" alt="Loading" class="loader">
        <img src="" alt="${model.name}" class="main-image" id="img-${key}">
    </div>
    <h3 class="product-title">${model.name}</h3>
    <p class="product-material">${model.description}</p>
    `;
    modelCard.addEventListener("click", () => {
      window.location.href = `model.html?id=${key}`;
    });
    modelList.appendChild(modelCard);
    loadModelImage(key, model.name); 
  });
};

const loadModelImage = async (key, modelName) => {
  const folderRef = storageRef(storage, `images/models/${key}/`);
  try {
    const result = await listAll(folderRef);
    if (result.items.length > 0) {
      const imageUrl = await getDownloadURL(result.items[0]);
      const imgElement = document.getElementById(`img-${key}`);
      if (imgElement) {
        imgElement.src = imageUrl;
        imgElement.style.display = "block"; // Показываем изображение
        imgElement.previousElementSibling.style.display = "none"; // Прячем лоадер
      }
    } else {
      throw new Error("Нет изображений");
    }
  } catch (error) {
    console.error(`Ошибка загрузки изображения для ${modelName}:`, error);
    const imgElement = document.getElementById(`img-${key}`);
    if (imgElement) {
      imgElement.src = "https://placehold.co/200x300";
      imgElement.style.display = "block";
      imgElement.previousElementSibling.style.display = "none";
    }
  }
};
document.addEventListener("DOMContentLoaded", fetchData);