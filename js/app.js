// Inregistram Service Worker-ul pentru functionalitate offline (caching)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('Service Worker înregistrat cu succes.'))
            .catch(err => console.error('Eroare la înregistrarea Service Worker:', err));
    });
}

// Elementele din DOM
const form = document.getElementById('form-notita');
const continutNotita = document.getElementById('continut-notita');
const statusConexiuneEl = document.getElementById('status-conexiune');
const listaNotiteLocaleEl = document.getElementById('lista-notite-locale');

// Functia de actualizare a starii online
function updateOnlineStatus() {
    if (navigator.onLine) {
        statusConexiuneEl.textContent = 'Online';
        statusConexiuneEl.style.color = '#32cd32'; // Verde
        sincronizeazaCuServerul();
    } else {
        statusConexiuneEl.textContent = 'Offline';
        statusConexiuneEl.style.color = '#ff6347'; // Rosu
    }
}

// Initializam baza de date locala
initDB().then(() => {
    // Dupa ce DB e gata, actualizam starea si afisam notitele locale
    updateOnlineStatus();
    afiseazaNotiteLocale();
});

// Ascultam evenimentul de trimitere a formularului
form.addEventListener('submit', event => {
    event.preventDefault();
    const notita = {
        continut: continutNotita.value
    };

    // Salvam local mai intai, apoi incercam sa trimitem la server
    // Aceasta strategie (save local first) este mai robusta
    adaugaNotitaInDB(notita);
    console.log('Notiță salvată local.');
    afiseazaNotiteLocale();
    form.reset();
    
    // Daca suntem online, incercam sa sincronizam imediat
    if (navigator.onLine) {
        sincronizeazaCuServerul();
    }
});

function trimiteLaServer(notita) {
    return fetch('api/sync.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notita)
    })
    .then(response => {
        if (!response.ok) {
            // Arunca o eroare daca raspunsul nu este OK (ex: 400, 500)
            throw new Error('Răspunsul serverului nu a fost OK');
        }
        return response.json();
    });
}

async function sincronizeazaCuServerul() {
    const notiteDeSincronizat = await preiaToateNotiteleDinDB();
    if (notiteDeSincronizat.length > 0) {
        console.log(`Încercare de sincronizare pentru ${notiteDeSincronizat.length} notițe...`);
        for (const notita of notiteDeSincronizat) {
            try {
                const data = await trimiteLaServer(notita);
                console.log('Răspuns de la server:', data.message);
                if (data.status === 'success') {
                    // Daca sincronizarea a reusit, stergem notita din IndexedDB
                    stergeNotitaDinDB(notita.id);
                }
            } catch (error) {
                console.error('Eroare la trimiterea unei notițe către server:', error);
                // Oprim sincronizarea daca o cerere esueaza pentru a nu pierde date
                break;
            }
        }
        // Dupa ce am terminat (sau ne-am oprit), actualizam UI-ul
        afiseazaNotiteLocale();
    } else {
        console.log('Nicio notiță de sincronizat.');
    }
}

// Functie pentru a afisa notitele din IndexedDB in UI
async function afiseazaNotiteLocale() {
    const notite = await preiaToateNotiteleDinDB();
    listaNotiteLocaleEl.innerHTML = '';
    if (notite.length === 0) {
        listaNotiteLocaleEl.innerHTML = '<li>Nicio notiță în așteptare.</li>';
    } else {
        notite.forEach(notita => {
            const li = document.createElement('li');
            li.textContent = notita.continut.substring(0, 80) + '... (așteaptă sincronizare)';
            listaNotiteLocaleEl.appendChild(li);
        });
    }
}

// Gestionam evenimentele de online/offline
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);