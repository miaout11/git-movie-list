const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

// 先宣告一個拿已經收藏的movie的資料
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []
const dataPanel = document.querySelector('#data-panel')

// 建一個函式負責把資料呈現出來
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
                    <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
                </div>
            </div>
        </div>
        </div>
         `
     });
    dataPanel.innerHTML = rawHTML
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

function removeFromFavorite(id) {
    // 增加錯誤處理條件式，因為一開始的movies為[]，會取不到值為null，所以這邊的意思為當 movies 的值不為 null 時或是其長度不為 0 時，直接結束函式。
    // 因為null和0皆為 falsy value，在前面加上 ! 符號就會變為 not false = true，所以當 movies 為 null 或是 0 的時候，皆會直接終止函式。 
    if (!movies || !movies.length) return
    // 使用findIndex()取得 index，findIndex只告訴我們那個項目的index。若沒能找到符合的項目，則會回傳-1。
    // 透過 id 找到要刪除電影的index
    const movieIndex = movies.findIndex((movie) => movie.id === id)
    // 增加錯誤處理條件式，如果傳入的 id 在收藏清單中不存在就結束這個函式
    if (movieIndex === -1) return
    // 確認看看有沒有正確抓到位置
    // return console.log(movieIndex)
    // 使用splice()移除元素，起點是movieIndex，刪除數量是1
    movies.splice(movieIndex, 1)
    //存回 local storage
    localStorage.setItem('favoriteMovies', JSON.stringify(movies))
    // 重新渲染畫面
    renderMovieList(movies) 
}



// 這裡不要用匿名函示，避免除錯時找不到哪支函示
dataPanel.addEventListener('click', function onPanelClicked(event) {
//  console.log(event.target)   
    // 監聽觀看電影資訊事件
    if (event.target.matches('.btn-show-movie')) {
        showMovieModal(Number(event.target.dataset.id))
    // 監聽收藏我的最愛電影事件
    } else if (event.target.matches('.btn-remove-favorite')) {
      removeFromFavorite(Number(event.target.dataset.id))
    }
})
//一定要用這個函式叫出收藏電影清單
renderMovieList(movies) 