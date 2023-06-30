let allPizzas = [];
let filteredPizzas = [];
let bucket = [];
let totalPrice = 0;

// Зберігає поточний стан кошика у localStorage у форматі JSON. 
function updateLocalStorage() {
	localStorage.pizzaKMA = JSON.stringify(bucket);
}

// Зчитує дані кошика з localStorage, якщо вони там є, і конвертує їх з формату JSON назад в об'єкт Javascript.
function fetchFromLocalStorage() {
	if (localStorage.getItem("pizzaKMA") != null) {
		bucket = JSON.parse(localStorage.getItem("pizzaKMA"));
	}
}

// Видаляє дані кошика з localStorage і перезавантажує сторінку.
function clearStorage() {
	localStorage.removeItem("pizzaKMA");
	location.reload();
}

// рендерить головний контент та бічну панель.
function renderHTML() {
	renderMain();
	renderAside();
}

// Рендерить список піц на основі фільтрованих, використовуючи renderPizzaFigure() для кожної піци.
function renderMain() {
	const itemsContainer = document.getElementById("pizzaSelection");
	itemsContainer.innerHTML = "";

	filteredPizzas.forEach((item) => {
		itemsContainer.append(renderPizzaFigure(item));
	});
}

// Розраховує загальну вартість піц в кошику, кількість піц і відображає ці значення на сторінці.
function updateBucketTotalPriceAndAmount() {
	totalPrice = 0;
	bucket.forEach((pizza) => {
		const { amount, size } = pizza;
		const summaryPrice = amount * size.price;
		totalPrice += summaryPrice;
	});
	document.getElementById("totalPrice").innerText = `${totalPrice} грн`;
	document.getElementById("bucketSize").innerText = bucket.length;
}

// Створює HTML-елемент для кожної піци, включаючи назву, зображення, опис, вибір розміру та кнопку купівлі.
function renderPizzaFigure(pizza) {
	const figure = document.createElement("figure");
	figure.classList.add("pizza");
	let remarkText = "";
	const remark = document.createElement("span");
	if (pizza.is_new) {
		remarkText = "Нова";
		remark.classList.add("new");
	} else if (pizza.is_popular) {
		remarkText = "Популярна";
		remark.classList.add("popular");
	}
	if (pizza.is_new || pizza.is_popular) {
		remark.classList.add("remark");
		remark.textContent = remarkText;
		figure.appendChild(remark);
	}
	const img = document.createElement("img");
	img.src = pizza.icon;
	img.alt = pizza.title;
	figure.appendChild(img);
	const figcaption = document.createElement("figcaption");
	const article = document.createElement("article");
	const h2 = document.createElement("h2");
	h2.textContent = pizza.title;
	article.appendChild(h2);
	const p = document.createElement("p");
	p.classList.add("type");
	p.textContent = pizza.type;
	article.appendChild(p);
	const description = document.createElement("p");
	description.classList.add("description");
	description.textContent = generateDescription(pizza);
	article.appendChild(description);
	figcaption.appendChild(article);
	const sizeSelection = document.createElement("div");
	sizeSelection.classList.add("size-selection");
	["small_size", "big_size"].forEach((sizeType) => {
		if (sizeType in pizza) {
			const pizzaSection = document.createElement("section");
			pizzaSection.classList.add(sizeType);

			const diameter = document.createElement("span");
			diameter.classList.add("diameter");

			const diameterImg = document.createElement("img");
			diameterImg.src = "assets/images/size-icon.svg";
			diameterImg.alt = "Іконка діаметру";
			diameter.appendChild(diameterImg);

			const diameterValue = document.createElement("span");
			diameterValue.textContent = pizza[sizeType].size;
			diameter.appendChild(diameterValue);
			pizzaSection.appendChild(diameter);

			const weight = document.createElement("span");
			weight.classList.add("weight");

			const weightImg = document.createElement("img");
			weightImg.src = "assets/images/weight.svg";
			weightImg.alt = "Іконка ваги";
			weight.appendChild(weightImg);

			const weightValue = document.createElement("span");
			weightValue.textContent = pizza[sizeType].weight;
			weight.appendChild(weightValue);
			pizzaSection.appendChild(weight);

			const price = document.createElement("span");
			price.classList.add("price");

			const priceValue = document.createElement("p");
			priceValue.textContent = pizza[sizeType].price;
			price.appendChild(priceValue);

			const currency = document.createElement("span");
			currency.textContent = "грн.";
			price.appendChild(currency);
			pizzaSection.appendChild(price);

			const buyButton = document.createElement("button");
			buyButton.classList.add("orange-btn", "buy");
			buyButton.textContent = "Купити";
			
			pizzaSection.appendChild(buyButton);
			sizeSelection.appendChild(pizzaSection);
			buyButton.addEventListener("click", () => {
				let bucketPizza = bucketPizzaObject(pizza, pizza[sizeType]);
				bucketPizza.size.name = sizeType === "small_size" ? "Мала" : "Велика";
				let i = indexOfPizza(bucketPizza);
				if (i == -1) {
					bucket.push(bucketPizza);
				} else {
					bucket[i].amount++;
				}
				updateLocalStorage();
				renderAside();
			});
		}
	});
	figcaption.appendChild(sizeSelection);
	figure.appendChild(figcaption);
	return figure;
}

// Повертає індекс певної піци в кошику, якщо вона там є, або -1, якщо немає.
function indexOfPizza(pizza) {
	let includes = -1;

	bucket.forEach((bucketPizza, i) => {
		if (
			bucketPizza.title == pizza.title &&
			bucketPizza.size.name == pizza.size.name
		) {
			includes = i;
		}
	});
	return includes;
}

// Повертає об'єкт піци для зберігання в кошику
function bucketPizzaObject(pizza, size) {
	return { icon: pizza.icon, title: pizza.title, size: size, amount: 1 };
}

// Створює рядок опису для піци, з'єднуючи всі складники.
function generateDescription(pizza) {
	let description = [];
	Object.values(pizza.content).forEach((arr) => {
		arr.forEach((item) => description.push(item));
	});
	return description.join(", ");
}

// Рендерить бічну панель, що включає елементи кошика, використовуючи renderBucketItem() для кожної піци в кошику.
function renderAside() {
	document.getElementById("clearBucket").addEventListener("click", clearBucket);
	const itemsContainer = document.getElementById("bucket");
	itemsContainer.innerHTML = "";

	bucket.forEach((item) => {
		let section = renderBucketItem(item);
		itemsContainer.append(section);
		scrollBucket(itemsContainer);
	});
	resizeBucketItemsBackground();
	updateBucketTotalPriceAndAmount();
}

// Очищує кошик, видаляє дані з локального сховища і рендерить бічну панель заново.
function clearBucket() {
	bucket = [];
	updateLocalStorage();
	renderAside();
}

// Прокручує контейнер кошика до кінця, щоб користувач міг побачити останні додані піци.
function scrollBucket(itemsContainer) {
	itemsContainer.style.maxHeight = `calc(100vh - ${
		document.querySelector("aside header").offsetHeight +
		document.querySelector("aside footer").offsetHeight
	}px)`;
	itemsContainer.scrollTop = itemsContainer.scrollHeight;
}

// Змінює розмір фонового зображення кожної піци в кошику, щоб воно відповідало висоті елемента.
function resizeBucketItemsBackground() {
	document.querySelectorAll("section.bucket-item").forEach((section) => {
		section.style.backgroundSize = section.offsetHeight - 30 + "px";
		section.style.backgroundPositionX =
			section.offsetWidth - (section.offsetHeight - 30) / 2 + "px";
	});
}

// 
function renderBucketItem(bucketPizza) {
	const section = document.createElement("section");
	section.classList.add("bucket-item");

	const h3 = document.createElement("h3");
	h3.innerHTML = `${bucketPizza.title} <span class="size">(${bucketPizza.size.name})</span>`;
	section.appendChild(h3);

	const sizeSection = document.createElement("section");
	sizeSection.classList.add("size-section");

	const diameter = document.createElement("span");
	diameter.classList.add("diameter");

	const diameterImg = document.createElement("img");
	diameterImg.src = "assets/images/size-icon.svg";
	diameterImg.alt = "Іконка діаметру";
	diameter.appendChild(diameterImg);

	diameter.innerHTML += bucketPizza.size.size;
	sizeSection.appendChild(diameter);

	const weight = document.createElement("span");
	weight.classList.add("weight");

	const weightImg = document.createElement("img");
	weightImg.src = "assets/images/weight.svg";
	weightImg.alt = "Іконка ваги";
	weight.appendChild(weightImg);

	weight.innerHTML += bucketPizza.size.weight;
	sizeSection.appendChild(weight);

	section.appendChild(sizeSection);

	const controlSection = document.createElement("section");
	controlSection.classList.add("control-section");

	const price = document.createElement("span");
	price.classList.add("price");
	price.textContent = `${bucketPizza.size.price}грн`;
	controlSection.appendChild(price);

	const amountDiv = document.createElement("div");

	const lessBtn = document.createElement("button");
	lessBtn.classList.add("less-btn");
	lessBtn.dataset.tooltip = "Зменшити кількість";
	lessBtn.textContent = "–";
	amountDiv.appendChild(lessBtn);

	const amount = document.createElement("span");
	amount.classList.add("amount");
	amount.textContent = bucketPizza.amount;
	amountDiv.appendChild(amount);

	const moreBtn = document.createElement("button");
	moreBtn.classList.add("more-btn");
	moreBtn.dataset.tooltip = "Збільшити кількість";
	moreBtn.textContent = "+";
	amountDiv.appendChild(moreBtn);
	moreBtn.addEventListener("click", (e) => {
		e.preventDefault();
		bucketPizza.amount++;
		amount.textContent = bucketPizza.amount;
		updateBucketTotalPriceAndAmount();
		updateLocalStorage();
	});

	lessBtn.addEventListener("click", (e) => {
		e.preventDefault();
		if (bucketPizza.amount > 1) {
			bucketPizza.amount--;
			amount.textContent = bucketPizza.amount;
		} else {
			section.remove();
			bucket.splice(indexOfPizza(bucketPizza), 1);
			resizeBucketItemsBackground();
		}
		updateBucketTotalPriceAndAmount();
		updateLocalStorage();
	});

	controlSection.appendChild(amountDiv);

	const deleteBtn = document.createElement("button");
	deleteBtn.classList.add("delete");
	deleteBtn.dataset.tooltip = "Видалити з корзини";
	deleteBtn.textContent = "×";

	deleteBtn.addEventListener("click", (e) => {
		e.preventDefault();
		section.remove();
		bucket.splice(indexOfPizza(bucketPizza), 1);
		resizeBucketItemsBackground();
		updateBucketTotalPriceAndAmount();
		updateLocalStorage();
	});

	controlSection.appendChild(deleteBtn);

	section.appendChild(controlSection);
	section.style.backgroundImage = `url(${bucketPizza.icon})`;

	return section;
}

function fetchPizzaList(callback) {
	fetch("Pizza_List.json")
		.then((response) => response.json())
		.then((data) => callback(data))
		.catch((error) => console.log(error));
}

function handleFilters() {
	let filterOptions = document.querySelectorAll("nav li");
	filterOptions.forEach((item) => {
		item.addEventListener("click", () => {
			filterOptions.forEach((li) => li.classList.remove("selected"));
			item.classList.add("selected");
			applyFilter(item.id);
		});
	});
}
function applyFilter(id) {
	const title = document.getElementById("title");
	switch (id) {
		case "all": {
			title.innerText = "Усі піци ";
			filteredPizzas = allPizzas;
			break;
		}
		case "meat": {
			title.innerText = "М'ясні ";
			filteredPizzas = allPizzas.filter((pizza) => pizza.type == "М’ясна піца");
			break;
		}
		case "with-pineapples": {
			title.innerText = "З ананасами ";
			filteredPizzas = allPizzas.filter(
				(pizza) => "pineapple" in pizza.content
			);
			break;
		}
		case "with-mushrooms": {
			title.innerText = "З грибами ";
			filteredPizzas = allPizzas.filter((pizza) => "mushroom" in pizza.content);
			break;
		}
		case "with-seaproducts": {
			title.innerText = "З морепродуктами ";
			filteredPizzas = allPizzas.filter(
				(pizza) => pizza.type == "Морська піца"
			);
			break;
		}
		case "vega": {
			title.innerText = "Вега ";
			filteredPizzas = allPizzas.filter((pizza) => pizza.type == "Вега піца");
			break;
		}
	}
	renderMain();
	document.getElementById("allPizzasAmount").innerText = filteredPizzas.length;
}
function stringifyOrder() {
	return bucket
		.map((pizza) => {
			return `${pizza.size.name} ${pizza.title} (${pizza.amount} шт.)`;
		})
		.join(", ");
}
function hideAsideWithClick() {
	const aside = document.getElementById("bucketAside");

	document.querySelector("body > main").addEventListener("click", (event) => {
		if (event.target.closest("#openBucketBtn")) {
			// Clicked element is the #openBucketBtn or its descendant, do nothing
			return;
		}
		if (window.innerWidth <= 530 && window.innerWidth > 300) {
			aside.style.transform = "translateX(100%)";
		}
	});
}
function hideAsideWithSwipe() {
	// Variables to store swipe start and end coordinates
	let startX = 0;
	let endX = 0;

	// Minimum swipe distance threshold
	const minSwipeDistance = 30;

	// Element to attach the swipe event listener

	const aside = document.getElementById("bucketAside");
	// Add touchstart event listener

	aside.addEventListener("touchstart", function (event) {
		console.log(event)
		startX = event.touches[0].clientX;
	
	});
	// Add touchend event listener
	aside.addEventListener("touchend", function (event) {
		console.log(event)
		if (window.innerWidth <= 530 && window.innerWidth > 300) {
			endX = event.changedTouches[0].clientX;
	

			// Calculate the distance in both X and Y axes
			const deltaX = endX - startX;
			

			// Check if the distance is greater than the threshold

			if (deltaX > minSwipeDistance) {
					// Right swipe
					console.log("Swiped right");
					aside.style.transform = "translateX(100%)";
				
			}
		}
	});
}
function showAside() {
	const aside = document.getElementById("bucketAside");

	document.getElementById("openBucketBtn").addEventListener("click", () => {
		aside.style.transform = "translateX(0)";
	});
}
function showOrHideAside() {
	if (window.innerWidth <= 530 && window.innerWidth > 300) {
		hideAsideWithSwipe();
		hideAsideWithClick();
		showAside();
	} else {
		document.getElementById("bucketAside").style.transform = "translateX(0)";
	}
}
window.onload = () => {
	fetchPizzaList((data) => {
		//console.log(data);
		allPizzas = data;
		filteredPizzas = allPizzas;
		handleFilters();
		if (localStorage.getItem("pizzaKMA") == null) {
			localStorage.setItem("pizzaKMA", JSON.stringify(bucket));
		}
		fetchFromLocalStorage();
		console.log(allPizzas);
		renderHTML();

		window.addEventListener("resize", () => {
			resizeBucketItemsBackground();
			showOrHideAside();
		});
		document.getElementById("order").addEventListener("click", () => {
			if (bucket.length == 0) {
				alert("Ви не вибрали жодної піци!");
			} else {
				let answer = confirm(
					"Ваше замовлення: " +
						stringifyOrder() +
						"\nДо сплати " +
						totalPrice +
						" грн. Підтверджуєте замовлення?"
				);
				if (answer == 1) {
					alert("Дякуємо за замовлення!");
					clearBucket();
				}
			}
		});

		showOrHideAside();
	});
};
