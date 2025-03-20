const apiKey = '1dc4cbf81f0accf4fa108820d551dafc'; // Your TMDb API key
const omdbApiKey = 'YOUR_OMDB_API_KEY'; // Replace with your OMDB API key
const language = 'fa-IR'; // Language set to Persian (Iran)
const baseImageUrl = 'https://image.tmdb.org/t/p/w500'; // TMDb base image URL
const defaultPoster = 'https://via.placeholder.com/500'; // Default poster fallback
const defaultBackdrop = 'https://via.placeholder.com/1920x1080'; // Default backdrop fallback
const movieId = new URLSearchParams(window.location.search).get('id');

async function getMovieDetails() {
    try {
        if (!movieId) {
            throw new Error('شناسه فیلم در URL وجود ندارد!');
        }

        // Define TMDb API endpoints
        const movieUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=${language}`;
        const externalIdsUrl = `https://api.themoviedb.org/3/movie/${movieId}/external_ids?api_key=${apiKey}`;
        const trailerUrl = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}`;

        // Fetch movie details from TMDb
        const movieRes = await fetch(movieUrl);
        if (!movieRes.ok) throw new Error(`Server error (movie details): ${movieRes.status}`);
        const movieData = await movieRes.json();

        // Fetch external IDs from TMDb
        const externalIdsRes = await fetch(externalIdsUrl);
        if (!externalIdsRes.ok) throw new Error(`Server error (external IDs): ${externalIdsRes.status}`);
        const externalIdsData = await externalIdsRes.json();

        // Fetch trailer data from TMDb
        const trailerRes = await fetch(trailerUrl);
        if (!trailerRes.ok) throw new Error(`Server error (trailer): ${trailerRes.status}`);
        const trailerData = await trailerRes.json();

        // Fetch poster from OMDB using imdb_id
        const imdbID = externalIdsData.imdb_id || '';
        let poster = defaultPoster; // Default fallback
        if (imdbID) {
            const omdbUrl = `https://www.omdbapi.com/?i=${imdbID}&apikey=${omdbApiKey}`;
            const omdbRes = await fetch(omdbUrl);
            if (!omdbRes.ok) throw new Error(`Server error (OMDB): ${omdbRes.status}`);
            const omdbData = await omdbRes.json();
            poster = omdbData.Poster && omdbData.Poster !== 'N/A' ? omdbData.Poster : defaultPoster;
        }

        // Process movie data
        const year = movieData.release_date ? movieData.release_date.split('-')[0] : 'نامشخص';
        const title = movieData.title || 'نامشخص';
        const backdrop = movieData.backdrop_path ? `${baseImageUrl}${movieData.backdrop_path}` : defaultBackdrop;
        const trailer = trailerData.results && trailerData.results[0] ? `https://www.youtube.com/embed/${trailerData.results[0].key}` : null;

        // Update page content
        document.getElementById('title').textContent = title;
        document.getElementById('overview').textContent = movieData.overview || 'خلاصه‌ای در دسترس نیست.';
        document.getElementById('genre').innerHTML = `<strong>ژانر:</strong> ${movieData.genres ? movieData.genres.map(g => g.name).join(', ') : 'نامشخص'}`;
        document.getElementById('year').innerHTML = `<strong>سال تولید:</strong> ${year}`;
        document.getElementById('rating').innerHTML = `<strong>امتیاز:</strong> ${movieData.vote_average || 'بدون امتیاز'}/10`;

        // Update images
        document.getElementById('poster').src = poster;
        document.getElementById('poster').alt = `پوستر فیلم ${title}`;
        document.getElementById('movie-bg').style.backgroundImage = `url('${backdrop}')`;

        // Update trailer
        const trailerContainer = document.getElementById('trailer');
        if (trailer) {
            trailerContainer.src = trailer;
            trailerContainer.title = `تریلر فیلم ${title}`;
        } else {
            trailerContainer.outerHTML = '<p class="text-yellow-500">تریلر در دسترس نیست</p>';
        }

        // Update meta tags and title
        document.getElementById('meta-title').textContent = `${title} - فیری مووی`;
        document.querySelector('meta[name="description"]').setAttribute('content', movieData.overview || `جزئیات و دانلود فیلم ${title} در فیری مووی.`);
        document.querySelector('meta[property="og:title"]').setAttribute('content', `${title} - فیری مووی`);
        document.querySelector('meta[property="og:description"]').setAttribute('content', movieData.overview || 'جزئیات و دانلود فیلم در فیری مووی.');
        document.querySelector('meta[property="og:image"]').setAttribute('content', poster);
        document.querySelector('meta[name="twitter:title"]').setAttribute('content', `${title} - فیری مووی`);
        document.querySelector('meta[name="twitter:description"]').setAttribute('content', movieData.overview || 'جزئیات و دانلود فیلم در فیری مووی.');
        document.querySelector('meta[name="twitter:image"]').setAttribute('content', poster);

        // Update structured data (Schema)
        const schema = {
            '@context': 'https://schema.org',
            '@type': 'Movie',
            'name': title,
            'description': movieData.overview || 'خلاصه‌ای در دسترس نیست.',
            'genre': movieData.genres ? movieData.genres.map(g => g.name).join(', ') : 'نامشخص',
            'datePublished': year,
            'image': poster,
            'aggregateRating': {
                '@type': 'AggregateRating',
                'ratingValue': movieData.vote_average || '0',
                'bestRating': '10',
                'ratingCount': '1'
            },
            'trailer': {
                '@type': 'VideoObject',
                'embedUrl': trailer || ''
            }
        };
        document.getElementById('movie-schema').textContent = JSON.stringify(schema);

        // Generate download links
        const downloadLinks = `
            <a href="https://berlin.saymyname.website/Movies/${year}/${imdbID.replace('tt', '')}" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" rel="nofollow">دانلود فیلم (لینک اصلی)</a>
            <a href="https://tokyo.saymyname.website/Movies/${year}/${imdbID.replace('tt', '')}" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" rel="nofollow">دانلود فیلم (لینک کمکی)</a>
            <a href="https://nairobi.saymyname.website/Movies/${year}/${imdbID.replace('tt', '')}" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" rel="nofollow">دانلود فیلم (لینک کمکی)</a>
            <button id="add-to-watchlist" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">افزودن به واچ لیست</button>
        `;
        document.getElementById('download-links').innerHTML = downloadLinks;

        // Add to watchlist functionality
        document.getElementById('add-to-watchlist').addEventListener('click', () => {
            let watchlist = JSON.parse(localStorage.getItem('watchlist')) || { movies: [], series: [] };
            if (!watchlist.movies.includes(movieId)) {
                watchlist.movies.push(movieId);
                localStorage.setItem('watchlist', JSON.stringify(watchlist));
                alert('فیلم به واچ لیست اضافه شد!');
            } else {
                alert('فیلم قبلاً در واچ لیست است!');
            }
        });
    } catch (error) {
        console.error('خطا در دریافت اطلاعات:', error);
        document.getElementById('download-links').innerHTML = `<p class="text-red-500">خطا در دریافت اطلاعات: ${error.message}</p>`;
    }
}

getMovieDetails();