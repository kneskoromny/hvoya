import '../css/style.css';
import { db } from '../js/firebase.js';
import { ref, get } from 'firebase/database';
import { ref as storageRef, getDownloadURL, listAll } from "firebase/storage";
import { storage } from "../js/firebase.js";

const loader = document.getElementById("page-loader");
const contentContainer = document.getElementById("content-container");
const carousel = document.getElementById("image-carousel");
const modelTitle = document.getElementById("model-title");
const modelDescription = document.getElementById("model-description");
const modelPrice = document.getElementById("model-price");
const fabricButtons = document.getElementById("fabric-buttons");
const colorContainer = document.getElementById("color-container");
const orderBtn = document.getElementById("order-btn");

const urlParams = new URLSearchParams(window.location.search);
const modelId = urlParams.get("id");

if (!modelId) {
  loader.textContent = "Ошибка: ID модели не указан";
} else {
  fetchModelData(modelId);
  orderBtn.textContent = "Заказать"
  orderBtn.addEventListener("click", () => {
    console.log("order btn did tap")
  });
}

async function fetchModelData(id) {
  try {
    // Получаем данные о модели
    const modelRef = ref(db, `models/${id}`);
    const modelSnap = await get(modelRef);
    if (!modelSnap.exists()) {
      throw new Error("Модель не найдена");
    }
    const modelData = modelSnap.val();

    // Получаем все ткани
    const fabricsRef = ref(db, `fabrics`);
    const fabricsSnap = await get(fabricsRef);
    if (!fabricsSnap.exists()) {
      throw new Error("Ткани не найдены");
    }
    const allFabrics = fabricsSnap.val();

    displayModelData(modelData, allFabrics);
  } catch (error) {
    console.error("Ошибка загрузки модели:", error);
    loader.textContent = "Ошибка загрузки модели 😕";
  }
}

function displayModelData(model, allFabrics) {
  modelTitle.textContent = model.name;
  modelDescription.textContent = model.description;
  modelPrice.textContent = `${model.price} ₽`;

  // Отображаем кнопки ткани
  renderFabricButtons(model.fabrics, allFabrics);
  loadModelImages(modelId);
  
  loader.style.display = "none";
  contentContainer.style.display = "block";
}


async function loadModelImages(id) {
  const folderRef = storageRef(storage, `images/models/${id}/`);
  try {
    const result = await listAll(folderRef);
    const imageUrls = await Promise.all(result.items.map(file => getDownloadURL(file)));
    renderCarousel(imageUrls);
  } catch (error) {
    console.error("Ошибка загрузки изображений:", error);
  }
}

function renderCarousel(images) {
  carousel.innerHTML = "";
  images.forEach(url => {
    const img = document.createElement("img");
    img.src = url;
    img.alt = "Модель";
    img.classList.add("carousel-image");
    // Добавляем обработчик клика для открытия изображения на весь экран
    img.addEventListener("click", () => openFullscreen(url));
    carousel.appendChild(img);
  });
}

function renderFabricButtons(fabrics, allFabrics) {
  fabricButtons.innerHTML = "";
  fabrics.forEach((fabricKey, index) => {
    const fabric = allFabrics[fabricKey]; // Получаем данные о ткани из allFabrics
    const button = document.createElement("button");
    button.textContent = fabric.name; // Отображаем название ткани
    button.classList.add("fabric-button");
    if (index === 0) {
      button.classList.add("active");
      loadFabricColors(fabricKey);
    }
    button.addEventListener("click", () => {
      document.querySelectorAll(".fabric-button").forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      loadFabricColors(fabricKey);
    });
    fabricButtons.appendChild(button);
  });
}


async function loadFabricColors(fabric) {
  colorContainer.innerHTML = "";

const folderRef = storageRef(storage, `images/colors/${fabric}/`);
  try {
    const result = await listAll(folderRef);
    const imageUrls = await Promise.all(result.items.map(file => getDownloadURL(file)));
    imageUrls.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        img.alt = "Цвет";
        img.addEventListener("click", () => openFullscreen(url));
        colorContainer.appendChild(img);

    });
  } catch (error) {
    console.error("Ошибка загрузки изображений:", error);
  }

}

function openFullscreen(url) {
  // Создаем контейнер для полноэкранного режима
  const fullscreenContainer = document.createElement("div");
  fullscreenContainer.classList.add("fullscreen");

  // Вставляем картинку
  fullscreenContainer.innerHTML = `<img src="${url}" alt="Полноразмерное изображение">`;

  // Добавляем обработчик клика для закрытия полноэкранного режима
  fullscreenContainer.addEventListener("click", () => fullscreenContainer.remove());

  // Добавляем контейнер в body
  document.body.appendChild(fullscreenContainer);
}

