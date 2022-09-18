const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

// 先宣告一個空陣列(容器)，裝movie的資料
const movies = []
let filteredMovies = []
const dataPanel = document.querySelector('#data-panel')
const switchListMode = document.querySelector('#switch-list-mode')
// 建立一個變數 searchForm 來存放搜尋表單這個 DOM 元件
const searchForm = document.querySelector('#search-form')
// 建立一個變數 searchInput 來存放輸入的值
const searchInput = document.querySelector('#search-input')
// 找出分頁器在HTML的位置，並抓出來
const paginator = document.querySelector('#paginator')
// 做分頁，先宣告一個變數，每頁只顯示12筆資料
const MOVIES_PER_PAGE = 12

// 建一個函式負責把資料呈現出來(card模式)
function renderMovieList(data) {
    let rawHTML = ''
// processing
    data.forEach((item) => {
        // console.log(item)
        // 每個item加上去，所以要用+= 
        rawHTML +=`
        <div class="col-sm-3">
        <div class="mb-2">
            <div class="card">
                <img src="${POSTER_URL + item.image}"
                    class="card-img-top" alt="Movie Poster">
                <div class="card-body">
                    <h5 class="card-title">${item.title}</h5>
                </div>
                <div class="card-footer">
                    <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"data-bs-target="#movie-modal" data-id="${item.id}">More</button>
                    <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
                </div>
            </div>
        </div>
        </div>
         `
     });
    dataPanel.innerHTML = rawHTML
}

// 再建一個函式改用list方式把資料呈現出來
function renderMovieList2(data) {
    let rawHTML = `<table class="table table-hover">`
// processing
    data.forEach((item) => {
        // console.log(item)
        // 每個item加上去，所以要用+= 
        rawHTML +=`
          <tr>
            <td><h5 class="card-title">${item.title}</h5></td>
            <td>
                <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"data-bs-target="#movie-modal" data-id="${item.id}">More</button>
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </td>
          </tr>
         `
     });

    rawHTML += `</table>`
    dataPanel.innerHTML = rawHTML
}

// 建立一個新的renderPaginator的函式
function renderPaginator(amount) {    
    // 先建立一個容器，把每頁的電影數量放入  80/12=6..餘8 餘數也要無條件進位
    // Math.ceil() 這個函式會把括號內算出的數字無條件進位成整數
    const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
    let rawHTML = ''
    for ( let page = 1; page <= numberOfPages; page++ ) {
        rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
    }
    paginator.innerHTML = rawHTML
}

// 建一個函式，負責從總清單裡切割資料(分頁數)，然後回傳切割好的新陣列。
function getMoviesByPage(page) {
    // 如果搜尋電影有東西就給搜尋結果，如果搜尋是沒有東西就給原本的分頁電影資料
    const data = filteredMovies.length ? filteredMovies : movies
    // page 1 => movies 0 - 11 // page 2 => movies 12 - 23 // page 1 => movies 24 - 35 ....
    const startIndex = (page -1) * MOVIES_PER_PAGE
    // 切割陣列使用slice方法，但我們需要告訴它開頭和結尾的index。記住，slice()結尾的index並不會包含在新陣列中。
    return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) {
    const modalTitle = document.querySelector('#movie-modal-title')
    const modalImage = document.querySelector('#movie-modal-image')
    const modalDate = document.querySelector('#movie-modal-date')
    const modalDescription = document.querySelector('#movie-modal-description')

    axios.get(INDEX_URL + id).then(response => {
        const data = response.data.results
        modalTitle.innerText = data.title
        modalDate.innerText = 'Release date: ' + data.release_date
        modalDescription.innerText = data.description
        modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
    })
}

// 建立一個可以儲存收藏電影的方式
function addToFavorite(id) { 
    // JSON.parse可以把取出的資料轉換成javascript裡的object or array
    // 建立一個收藏清單，去取存放在 local storage 的資料，第一次使用收藏功能時，此時 local storage 是空的，會取回 null 值，因此，list 會得到一個空陣列
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    // find() 在找到第一個符合條件的 item 後就會停下來回傳該 item。
    const movie = movies.find((movie) => movie.id === id)
    // 如果收藏清單已經有此電影就會跳出警示，some() 只會回報「陣列裡有沒有 item 通過檢查條件」，有的話回傳 true ，到最後都沒有就回傳 false(回傳值是布林值)
    if (list.some((movie) => movie.id === id)) {
        return alert('This movie is already in the favorite!')
    }
    // 把收藏的電影推進收藏清單裡
    list.push(movie)
    // JSON.stringify() 這個函式可以把存入的資料轉成JSON格式的字串
    // 接著呼叫 localStorage.setItem，把更新後的收藏清單同步到 local storage
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
    console.log(list)  
}


// 這裡不要用匿名函示，避免除錯時找不到哪支函示
dataPanel.addEventListener('click', function onPanelClicked(event) {
//  console.log(event.target)   
    // 監聽觀看電影資訊事件
    if (event.target.matches('.btn-show-movie')) {
        showMovieModal(Number(event.target.dataset.id))
    // 監聽收藏我的最愛電影事件
    } else if (event.target.matches('.btn-add-favorite')) {
        addToFavorite(Number(event.target.dataset.id))
    }
})

switchListMode.addEventListener('click', function switchMode(event) {

    if (event.target.matches('.card-mode')) {
        // change input value
        document.getElementById('Now-Mode').value = 'card'
        renderMovieList(getMoviesByPage(1))
    } else if (event.target.matches('.list-mode')) {
        // change input value
        document.getElementById('Now-Mode').value = 'list'
        renderMovieList2(getMoviesByPage(1))
    }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
    // 定義
    let mode = document.getElementById('Now-Mode').value
    if (event.target.tagName !== 'A')  return
    // 上面的if條件式裡的A指的是這個"<a></a>" 
    const page = Number(event.target.dataset.page)
    if (mode === 'card') {
        renderMovieList(getMoviesByPage(page))
    } else if (mode === 'list') {
        renderMovieList2(getMoviesByPage(page))
    }
})


// 做一個事件監聽器，監聽搜尋表單的提交 (submit) 事件
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
// preventDefault = 請瀏覽器不要做預設的動作
    event.preventDefault()
    // toLowerCase = 把字母變成小寫(讓搜尋不分大小寫都可以搜尋的到)
    const keyword = searchInput.value.trim().toLowerCase()
    // 去抓現在網頁的模式，切換不同render mode
  let mode = document.getElementById("Now-Mode").value;

    if (!keyword.length) {
        return alert('Please enter a valid string')
    }

    // 方法二:使用條件函式「這裡要放陣列名稱.filter(裡面要裝函式)」
    filteredMovies = movies.filter((movie) => 
      movie.title.toLowerCase().includes(keyword)
   )

   if (filteredMovies.length === 0) {
      return alert('Cannot find movie with keyword: ' + keyword)
   }
    // 方法一:使用for迴圈把搜尋到的結果推進filteredMovies[]裡，再用renderMovieList(filteredMovies)把搜尋結果重新渲染網頁畫面
    // for (const movie of movies) {
    //     if (movie.title.toLowerCase().includes(keyword)) {
    //         filteredMovies.push(movie)
    //     }
    // }
    if (mode === "card") {
        renderPaginator(filteredMovies.length);
        renderMovieList(getMoviesByPage(1));
      } else if (mode === "list") {
        renderPaginator(filteredMovies.length);
        renderMovieList2(getMoviesByPage(1));
      }
})

// 串接API
axios
    .get(INDEX_URL)
    .then((response) => {
        // 方法1：用"for-of"迭代器把資料推進陣列
        // for (const movie of response.data.results) {
        //   movies.push(movie)
        // } 
        // 方法２：用"展開運算子"展開陣列元素arr.push(「...」response.data)在資料結果前面加"..."
        movies.push(...response.data.results)
        renderPaginator(movies.length)
        renderMovieList(getMoviesByPage(1))
    })
    .catch((error) => console.log(error))

// 使用localStorage.setItem去存放在這個空間內，即使畫面重新整理也不會消失
// 存入資料 localStorage.setItem('default_language', 'english')
// 取得存在於localStorage的key: localStorage.getItem('default_language')
// 移除localStorage的key: localStorage.removeItem('default_language')



