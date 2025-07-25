// 使用 fetch 获取产品数据，并将它们传递给 init 函数
// 报告 fetch 操作中发生的任何错误
// 一旦产品数据成功加载并格式化为 JSON 对象（使用 response.json()），
// 就运行 initialize() 函数
fetch("products.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP 错误：${response.status}`);
    }
    return response.json();
  })
  .then((json) => initialize(json))
  .catch((err) => console.error(`Fetch 问题：${err.message}`));

// 设置应用程序逻辑，声明所需的变量，并包含所有其他函数
function initialize(products) {
  // 获取我们需要操作的 UI 元素
  const category = document.querySelector("#category");
  const searchTerm = document.querySelector("#searchTerm");
  const searchBtn = document.querySelector("button");
  const main = document.querySelector("main");

  // 记录最后一次输入的分类和搜索词
  let lastCategory = category.value;
  // 还没有进行搜索
  let lastSearch = "";

  // 这些变量包含按分类和搜索词过滤的结果
  // finalGroup 将包含需要显示的产品，每个都是一个对象数组。
  // 每个对象代表一个产品
  let categoryGroup;
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
  searchBtn.addEventListener("click", selectCategory);

  function selectCategory(e) {
    // 使用 preventDefault() 阻止表单提交 —— 这会破坏用户体验
    e.preventDefault();

    // 将这些变量重置为空数组，清除之前的搜索结果
    categoryGroup = [];
    finalGroup = [];

    // 如果分类和搜索词与上次搜索时相同，
    // 结果将相同，因此无需再次运行搜索 —— 直接从函数中返回
    if (
      category.value === lastCategory &&
      searchTerm.value.trim() === lastSearch
    ) {
      return;
    } else {
      // 更新最后一次分类和搜索词的记录
      lastCategory = category.value;
      lastSearch = searchTerm.value.trim();
      // 在这种情况下，我们想要选择所有产品，然后按搜索词过滤，
      // 因此我们只需将 categoryGroup 设置为整个 JSON 对象，然后运行 selectProducts()
      if (category.value === "All") {
        categoryGroup = products;
        selectProducts();
        // 如果选择了一个特定的分类，我们需要过滤掉不属于该分类的产品，
        // 然后将剩余的产品放入 categoryGroup，再运行 selectProducts()
      } else {
        // <option> 元素的值是大写的，而 JSON 中存储的分类（在 "type" 下）是小写的。
        // 因此，我们需要将分类转换为小写，然后才能进行比较
        const lowerCaseType = category.value.toLowerCase();
        // 过滤 categoryGroup，只保留类型包含分类的产品
        categoryGroup = products.filter(
          (product) => product.type === lowerCaseType
        );

        // 在完成过滤后运行 selectProducts()
        selectProducts();
      }
    }
  }

  // selectProducts() 从 selectCategory() 选择的产品组中进一步
  // 按分层搜索词过滤产品
  function selectProducts() {
    // 如果没有输入搜索词，只需将 finalGroup 数组设置为 categoryGroup
    // 数组 —— 我们不想进一步过滤产品。
    if (searchTerm.value.trim() === "") {
      finalGroup = categoryGroup;
    } else {
      // 在比较之前，确保将搜索词转换为小写。为了简化问题，
      // 我们将产品名称都保持小写
      const lowerCaseSearchTerm = searchTerm.value.trim().toLowerCase();
      // 过滤 finalGroup，只保留名称包含搜索词的产品
      finalGroup = categoryGroup.filter((product) =>
        product.name.includes(lowerCaseSearchTerm)
      );
    }
    // 一旦我们有了最终的产品组，更新显示
    updateDisplay();
  }

  // 开始更新显示，显示新的产品集
  function updateDisplay() {
    // 移除 <main> 元素中的上一次内容
    while (main.firstChild) {
      main.removeChild(main.firstChild);
    }

    // 如果没有产品匹配搜索词，显示一条“没有结果可显示”的消息
    if (finalGroup.length === 0) {
      const para = document.createElement("p");
      para.textContent = "没有结果可显示！";
      main.appendChild(para);
      // 对于我们想要显示的每个产品，将它的产品对象传递给 fetchBlob()
    } else {
      for (const product of finalGroup) {
        fetchBlob(product);
      }
    }
  }

  // fetchBlob 使用 fetch 获取该产品的图片，然后将
  // 最终的图片显示 URL 和产品对象传递给 showProduct() 以最终显示
  function fetchBlob(product) {
    // 根据 product.image 属性构造图片文件的 URL 路径
    const url = `images/${product.image}`;
    // 使用 fetch 获取图片，并将返回的响应转换为 blob
    // 再次说明，如果发生任何错误，我们在控制台中报告它们。
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP 错误：${response.status}`);
        }
        return response.blob();
      })
      .then((blob) => showProduct(blob, product))
      .catch((err) => console.error(`Fetch 问题：${err.message}`));
  }

  // 在 <main> 元素中显示一个产品
  function showProduct(blob, product) {
    // 将 blob 转换为对象 URL —— 这基本上是一个临时的内部 URL，
    // 指向存储在浏览器中的一个对象
    const objectURL = URL.createObjectURL(blob);
    // 创建 <section>、<h2>、<p> 和 <img> 元素
    const section = document.createElement("section");
    const heading = document.createElement("h2");
    const para = document.createElement("p");
    const image = document.createElement("img");

    // 给 <section> 设置一个类名，等于产品 "type" 属性，以便正确显示图标
    section.setAttribute("class", product.type);

    // 将 <h2> 的 textContent 设置为产品 "name" 属性，但将第一个字符
    // 替换为第一个字符的大写形式
    heading.textContent = product.name.replace(
      product.name.charAt(0),
      product.name.charAt(0).toUpperCase()
    );

    // 将 <p> 的 textContent 设置为产品 "price" 属性，并在前面加上 $ 符号
    // 使用 toFixed(2) 将价格固定为两位小数，以便例如 1.40 显示为 1.40，而不是 1.4。
    para.textContent = `$${product.price.toFixed(2)}`;

    // 将 <img> 的 src 设置为对象 URL，并将 alt 设置为产品 "name" 属性
    image.src = objectURL;
    image.alt = product.name;

    // 适当地将元素附加到 DOM 中，将产品添加到 UI 中
    main.appendChild(section);
    section.appendChild(heading);
    section.appendChild(para);
    section.appendChild(image);
  }
}
