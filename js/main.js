import '../css/style.css'
import { db } from '../js/firebase.js';
import { ref, onValue } from 'firebase/database'
import { ref as storageRef, getDownloadURL, listAll } from "firebase/storage";
import { storage } from "../js/firebase.js"; // Импортируем хранилище


console.log("Firebase подключен!");

// Функция для загрузки данных
const loadData = () => {
    const dataRef = ref(db, "products"); // Путь к данным (замени на свой)

    onValue(dataRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            console.log("Полученные данные:", data);
            renderData(data)
        } else {
            console.log("Данные отсутствуют");
        }
    }, (error) => {
        console.error("Ошибка загрузки данных:", error);
    });
};

const renderData = (data) => {
    const container = document.getElementById("product-list");
    container.innerHTML = ""; // Очищаем перед обновлением

    Object.keys(data).forEach(async (key) => {
        const item = data[key];

        const productElement = document.createElement("div");
        productElement.classList.add("product-card");

        // Создаем ссылку на папку в Storage
        const folderRef = storageRef(storage, `images/products/${key}/`);

        try {
            const result = await listAll(folderRef); // Получаем список файлов
            const imageUrls = await Promise.all(
                result.items.map(async (fileRef) => await getDownloadURL(fileRef))
            );

            // Формируем карточку с изображениями (первое — основное, остальные — миниатюры)
            productElement.innerHTML = `
                <div class="product-images">
                    <img src="${imageUrls[0] || 'https://via.placeholder.com/250x180'}" alt="${item.name}" class="main-image">
                    <div class="thumbnails">
                        ${imageUrls.slice(1).map(url => `<img src="${url}" class="thumbnail">`).join('')}
                    </div>
                </div>
                <h3 class="product-title">${item.name}</h3>
                <p class="product-material">Материал: ${item.fabric}</p>
                <p class="product-price">${item.price.standard} ₽</p>
            `;

        } catch (error) {
            console.error("Ошибка загрузки изображений:", error);
            productElement.innerHTML = `
                <img src="https://via.placeholder.com/250x180" alt="Placeholder">
                <h3 class="product-title">${item.title}</h3>
                <p class="product-material">Материал: ${item.material}</p>
                <p class="product-price">${item.price} ₽</p>
            `;
        }

        container.appendChild(productElement);
    });
};

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("thumbnail")) {
        const mainImage = e.target.closest(".product-card").querySelector(".main-image");
        mainImage.src = e.target.src;
    }
});




document.addEventListener("DOMContentLoaded", loadData);