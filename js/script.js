const overlay1 = document.querySelector('.overlay-1'),
    overlay2 = document.querySelector('.overlay-2'),
    search = document.querySelector('.search'),
    input = document.querySelector('.input');

overlay1.addEventListener('click', () => {
    search.classList.toggle('active');
    if (search.classList.contains('active')) {
        setTimeout(() => {
            input.focus();
        }, 200);
    }
});

search.addEventListener('click', () => {
    if (search.classList.contains('active')) {
        setTimeout(() => {
            input.focus();
        }, 200);
    }
});

overlay2.addEventListener('click', (e) => {
    input.value = '';
    input.focus();
    search.classList.remove('searching');
});

document.body.addEventListener('click', (e) => {
    if (!search.contains(e.target) && input.value.length === 0) {
        search.classList.remove('active');
        search.classList.remove('searching');
        input.value = '';
    }
});

input.addEventListener('input', () => {
    if (input.value.length > 0) {
        search.classList.add('searching');
    } else {
        search.classList.remove('searching');
    }
});

input.value = '';
input.blur();


/// api
async function getResource(url) {
    let res = await fetch(url);

    if (!res.ok) {
        throw new Error(alert(`Could not fetch ${url}, status: ${res.status}`));
    }

    return await res.json();
}

class ShortCard {
    constructor(poster, title, year, type, imdbID, parentSelector, ...classes) {
        this.poster = poster;
        this.title = title;
        this.year = year;
        this.type = type;
        this.imdbID = imdbID;
        this.classes = classes;
        this.parent = document.querySelector(parentSelector);
    }

    render() {
        const element = document.createElement('div');

        if (this.classes.length === 0) {
            this.classes = "wrapper-short-card";
            element.classList.add(this.classes);
        } else {
            this.classes.forEach(className => element.classList.add(className));
        }

        element.innerHTML = `   
        <div class="card">
        <div class="card__imgBx">
          <img src="${this.poster}" alt="">
        </div>
        <div class="content">
          <h2 class="content__title">${this.title}</h2>
          <p class="content__type">${this.type}</p>
          <p class="content__year">${this.year}</p>
          <button class="learn-more" >
          <span class="circle" aria-hidden="true" >
            <span class="icon arrow"></span>
          </span>
          <span class="button-text" data-id = '${this.imdbID}'>Learn More</span>
        </button>
        </div>
      </div>`;
        this.parent.append(element);
    }
}

class FullCard extends ShortCard {
    constructor(poster, title, year, director, runtime, type, descr, parentSelector, ...classes) {
        super(poster, title, type, year, parentSelector, ...classes);
        this.director = director;
        this.runtime = runtime;
        this.descr = descr;
    }
    render() {
        const element = document.createElement('div');

        if (this.classes.length === 0) {
            this.classes = "wrapper-full-card";
            element.classList.add(this.classes);
        } else {
            this.classes.forEach(className => element.classList.add(className));
        }

        element.innerHTML = `
        <div id="modal" class="myModal" data-modal>
         <div class="modal-content">
            <div class="movie_card" id="tomb">
                <div class="info_section">
                    <div class="movie_header">
                        <div id="close" data-close>&times;</div>
                        <img class="locandina" src="${this.poster}" />
                        <h1>${this.title}</h1>
                        <h4>${this.year}, ${this.director}</h4>
                        <span class="minutes">${this.runtime}</span>
                        <p class="type">${this.type}</p>
                    </div>
                    <div class="movie_desc">
                        <p class="text">${this.descr}</p>
                    </div>
                </div>
                <div class="blur_back"></div>
            </div>
         </div>
        </div>`;
        this.parent.append(element);
    }
}

input.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        input.blur();
        getResource(`http://www.omdbapi.com/?s=${input.value}&apikey=9dc95220`)
            .then(data => {
                console.log(data);
                data.Search.forEach(({
                    Poster,
                    Title,
                    Year,
                    Type,
                    imdbID
                }) => {
                    new ShortCard(Poster, Title, Year, Type, imdbID, ".container-short-card").render();
                });
            })
            .catch(() => {
                alert('No such movie was found!');
            });
    }

});


document.querySelectorAll('.container-short-card').forEach(card => {
    card.addEventListener('click', (event) => {
        const target = event.target;
        if (target && target.dataset.id) {
            document.body.style.overflow = 'hidden';
            getResource(`http://www.omdbapi.com/?i=${target.dataset.id}&apikey=9dc95220`)
                .then(data => {
                    console.log(data);
                    new FullCard(data.Poster, data.Title, data.Year, data.Director, data.Runtime, data.Genre, data.Plot, data.imdbID, ".container-full-card").render();
                });
        }
    });

    overlay2.addEventListener('click', () => {
        console.log('delete');
        const card = document.querySelector('.container-short-card');
        while (card.firstChild) {
            card.removeChild(card.firstChild);
        }
    });
});

document.querySelectorAll('.container-full-card').forEach(element => {

    element.addEventListener('click', () => {
        const card = document.querySelector('.container-full-card');

        document.querySelector("[data-close]").addEventListener('click', () => {
            document.body.style.overflow = 'scroll';
            while (card.firstChild) {
                card.removeChild(card.firstChild);
            }
        });
        window.addEventListener("click", (e) => {
            const target = e.target;
            if (target === document.querySelector('#modal')) {
                document.body.style.overflow = 'scroll';
                while (card.firstChild) {
                    card.removeChild(card.firstChild);
                }
            }
        });
    });
});