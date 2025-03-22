import '../css/style.css'
import { db } from '../js/firebase.js';
import { ref, get } from 'firebase/database'
import { ref as storageRef, getDownloadURL, listAll } from "firebase/storage";
import { storage } from "../js/firebase.js"; // Импортируем хранилище

const categoriesRef = ref(db, "categories");
const productsRef = ref(db, "products");

let categoriesData = {};
let productsData = {};

const loader = document.getElementById("page-loader")
const categoriesSlider = document.getElementById('categories-slider');
const productList = document.getElementById("product-list");

let selectedCategory = null;

/* Загрузка Категорий и Продуктов */
const fetchData = async () => {
    try {
        const [categoriesSnap, productsSnap] = await Promise.all([
            get(categoriesRef),
            get(productsRef),
        ])
        if (categoriesSnap.exists()) {
            categoriesData = categoriesSnap.val();
        }
        if (productsSnap.exists()) {
            productsData = productsSnap.val();
        }
        renderCategories(categoriesData);
        renderProducts(productsData);
        loader.style.display = 'none';
    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        loader.textContent = "Ошибка загрузки данных 😕";
    }
}
/* Рендер Категорий */
const renderCategories = (categories) => {
  categoriesSlider.innerHTML = ''; // Очищаем перед рендерингом
  categoriesSlider.style.display = "flex"; // Показываем слайдер

  Object.keys(categories).forEach((key, index) => {
    const category = categories[key];

    const button = document.createElement('button');
    button.classList.add('category-button');
    button.textContent = category.name;
    
    // Выбираем первую категорию по умолчанию
    if (index === 0) {
      selectedCategory = category.name;
      button.classList.add('active');
    }

    // Обработчик клика
    button.addEventListener('click', () => {
      selectedCategory = category.name;
      updateCategorySelection();
      renderProducts(productsData); // Перерисовываем продукты
    });

    categoriesSlider.appendChild(button);
  });

  updateCategorySelection();
};

const renderProducts = (products) => {
  productList.innerHTML = ''; // Очищаем список перед рендерингом
  productList.style.display = 'flex';

  Object.keys(products).forEach((key) => {
    const product = products[key];

    // Фильтруем по выбранной категории
    if (product.categoryName !== selectedCategory) {
      return;
    }

    const productCard = document.createElement('div');
    productCard.classList.add('product-card');
    productCard.setAttribute('data-key', key); // Добавляем атрибут для поиска

    productCard.innerHTML = `
    <div class="product-image">
        <img src="../assets/loader.gif" alt="Loading" class="loader">
        <img src="" alt="${product.name}" class="main-image" id="img-${key}">
    </div>
    <h3 class="product-title">${product.name}</h3>
    <p class="product-material">Материал: ${product.fabric}</p>
    <p class="product-price">${product.price.standard} ₽</p>
`;


    productList.appendChild(productCard);
    loadProductImage(key, product.name); // Запускаем загрузку изображения
  });
};

const loadProductImage = async (key, productName) => {
  const folderRef = storageRef(storage, `images/products/${key}/`);
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
    console.error(`Ошибка загрузки изображения для ${productName}:`, error);
    const imgElement = document.getElementById(`img-${key}`);
    if (imgElement) {
      imgElement.src = "https://placehold.co/200x300";
      imgElement.style.display = "block";
      imgElement.previousElementSibling.style.display = "none";
    }
  }
};


const updateCategorySelection = () => {
  document.querySelectorAll('.category-button').forEach(button => {
    if (button.textContent === selectedCategory) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
};

document.addEventListener("DOMContentLoaded", fetchData);