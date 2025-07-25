fetch("products.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("HTTP error: ${response.status}");
    }
    return response.json();
  })
  .then((json) => initialize(json))
  .catch((err) => console.error("Fetch problem: ${err.message}"));

function initialize(products) {
  const category = document.querySelector("#category");
  const search = document.querySelector("#search");
  const searchButton = document.querySelector("button");
  const main = document.querySelector("main");

  // 记录最后一次输入的分类和搜索词
  let lastCategory = category.value;
  // 还没有进行搜索
  let lastSearch = "";

  let categoryGroup;
  // finalGroup 将包含需要显示的产品，每个都是一个对象数组。
  let finalGroup;

  // 首先，将 finalGroup 设置为整个产品数据库，
  // 然后运行 updateDisplay()，以便最初显示所有产品。
  finalGroup = products;
  updateDisplay();

  // 将它们设置为空数组，为搜索做好准备
  categoryGroup = [];
  finalGroup = [];

  // 当点击搜索按钮时，调用 selectCategory() 开始
  // 搜索以选择我们想要显示的产品分类
  searchButton.addEventListener("click", selectCategory);

  function selectCategory(e) {
    // 使用 preventDefault() 阻止表单提交 —— 这会破坏用户体验
    e.preventDefault();

    // 将这些变量重置为空数组，清除之前的搜索结果
    categoryGroup = [];
    finalGroup = [];

    // 如果分类和搜索词与上次搜索时相同，
    // 结果将相同，因此无需再次运行搜索 —— 直接从函数中返回
    if (category.value === lastCategory && search.value.trim() === lastSearch) {
      return;
    } else {
      lastCategory = category.value;
      lastSearch = search.value.trim();
      if (category.value === "All") {
        categoryGroup = products;
        selectProducts();
      } else {
        // 如果选择了一个特定的分类，我们需要过滤掉不属于该分类的产品，
        // 然后将剩余的产品放入 categoryGroup，再运行 selectProducts()
        const lowerCaseType = category.value.toLowerCase();
        categoryGroup = products.filter(
          (product) => product.type === lowerCaseType
        );
        selectProducts();
      }
    }
  }
  function selectProducts() {
    if (search.value.trim() === "") {
      finalGroup = categoryGroup;
    } else {
      const lowerCaseSearch = search.value.trim().toLowerCase();
      finalGroup = categoryGroup.filter((product) =>
        product.name.toLowerCase().includes(lowerCaseSearch)
      );
    }
    updateDisplay();
  }

  function updateDisplay() {
    while (main.firstChild) {
      main.removeChild(main.firstChild);
    }

    if (finalGroup.length === 0) {
      const para = document.createElement("p");
      para.textContent = "没有结果可显示";
      main.appendChild(para);
    } else {
      for (const product of finalGroup) {
        fetchBlob(product);
      }
    }
  }

  function fetchBlob(product) {
    const url = `images/${product.image}`;
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Http 错误： ${response.status}`);
        }
        return response.blob();
      })
      .then((blob) => {
        showProduct(blob, product);
      })
      .catch((err) => {
        console.error(`Fetch 错误： ${err.message}`);
      });
  }

  function showProduct(blob, product) {
    const objectURL = URL.createObjectURL(blob);
    const section = document.createElement("section");
    const heading = document.createElement("h2");
    const para = document.createElement("p");
    const image = document.createElement("img");

    section.setAttribute("class", product.type);

    heading.textContent = product.name.replace(
      product.name.charAt(0),
      product.name.charAt(0).toUpperCase()
    );
    para.textContent = `$${product.price.toFixed(2)}`;
    image.src = objectURL;
    image.alt = product.name;

    main.appendChild(section);
    section.appendChild(heading);
    section.appendChild(para);
    section.appendChild(image);
  }
}
