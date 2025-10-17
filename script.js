/* ---------- Configuración ---------- */
const YEARS = [
  { label: '1°', cursos: ['A','B','C','D','E','F','G'] },
  { label: '2°', cursos: ['A','B','C','D'] },
  { label: '3°', cursos: ['A','B','C','D'] },
  { label: '4°', cursos: ['A','B','C','D'] },
  { label: '5°', cursos: ['A','B','C','D'] },
  { label: '6°', cursos: ['A','B','C','D'] },
  { label: '7°', cursos: ['A','B','C','D'] }
];

const LS_KEY = 'comedor_alumnos_v2';

/* ---------- Datos iniciales ---------- */
function initDataIfNeeded(){
  if(localStorage.getItem(LS_KEY)) return;
  const data = {};
  YEARS.forEach(y=>{
    y.cursos.forEach(c=>{
      const key = `${y.label}-${c}`;
      data[key] = [];
      for(let i=1;i<=5;i++){
        data[key].push({
          nombre: `${c} Alumno ${i}`,
          dni: `DNI${Math.floor(Math.random()*90000)+10000}`,
          email: `alumno${i}@escuela.edu`,
          reserva: { Desayuno: null, Almuerzo: null, Merienda: null, Cena: null }
        });
      }
    });
  });
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}
initDataIfNeeded();

function loadData(){ return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); }
function saveData(d){ localStorage.setItem(LS_KEY, JSON.stringify(d)); }

/* ---------- Estado UI ---------- */
let yearIndex = 0;
let cursoIndex = 0;
const yearLabelEl = document.getElementById('yearLabel');
const cursoLabelEl = document.getElementById('cursoLabel');
const alumnosListEl = document.getElementById('alumnosList');

function getCurrentKey(){
  return `${YEARS[yearIndex].label}-${YEARS[yearIndex].cursos[cursoIndex]}`;
}

/* ---------- Render alumnos ---------- */
function renderAlumnos(){
  const data = loadData();
  const key = getCurrentKey();
  const lista = data[key] || [];
  alumnosListEl.innerHTML = '';

  lista.forEach(al => {
    const card = document.createElement('div');
    card.className = 'border border-gray-200 rounded p-3 bg-white';

    const nombre = document.createElement('div');
    nombre.className = 'font-semibold text-gray-800';
    nombre.textContent = al.nombre;

    const detalles = document.createElement('div');
    detalles.className = 'text-xs text-gray-500';
    let anotados = [];
    for (const t of ['Desayuno','Almuerzo','Merienda','Cena']){
      if (al.reserva[t]) anotados.push(`${t}: ${al.reserva[t]}`);
    }
    detalles.textContent = anotados.length ? `Anotado por: ${anotados.join(' • ')}` : 'No anotado';

    const indicadores = document.createElement('div');
    indicadores.className = 'mt-2 flex gap-3 flex-wrap';
    ['Desayuno','Almuerzo','Merienda','Cena'].forEach(tipo=>{
      const pill = document.createElement('div');
      pill.className = 'flex items-center gap-2 text-sm';
      const mark = document.createElement('span');
      if(al.reserva[tipo]){
        mark.innerHTML = '<svg class="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15 5 11.586a1 1 0 011.414-1.414L8.414 12.172 15.293 5.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>';
      } else {
        mark.innerHTML = '<svg class="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path d="M10 9l3-3 1 1-3 3 3 3-1 1-3-3-3 3-1-1 3-3-3-3 1-1 3 3z"/></svg>';
      }
      const label = document.createElement('span');
      label.className = 'text-xs text-gray-700';
      label.textContent = tipo;
      pill.appendChild(mark);
      pill.appendChild(label);
      indicadores.appendChild(pill);
    });

    card.appendChild(nombre);
    card.appendChild(detalles);
    card.appendChild(indicadores);
    alumnosListEl.appendChild(card);
  });

  yearLabelEl.textContent = YEARS[yearIndex].label;
  cursoLabelEl.textContent = YEARS[yearIndex].cursos[cursoIndex];
}

/* ---------- Navegación año / curso ---------- */
document.getElementById('prevYear').addEventListener('click', ()=>{
  if(yearIndex>0){ yearIndex--; cursoIndex=0; renderAlumnos(); }
});
document.getElementById('nextYear').addEventListener('click', ()=>{
  if(yearIndex<YEARS.length-1){ yearIndex++; cursoIndex=0; renderAlumnos(); }
});
document.getElementById('prevCurso').addEventListener('click', ()=>{
  if(cursoIndex>0){ cursoIndex--; renderAlumnos(); }
});
document.getElementById('nextCurso').addEventListener('click', ()=>{
  if(cursoIndex < YEARS[yearIndex].cursos.length-1){ cursoIndex++; renderAlumnos(); }
});

/* ---------- Dropdown ---------- */
const preceptorBtn = document.getElementById('preceptorBtn');
const preceptorMenu = document.getElementById('preceptorMenu');
preceptorBtn.addEventListener('click', (e)=>{
  e.stopPropagation();
  preceptorMenu.classList.toggle('hidden');
});
document.addEventListener('click', (e)=>{
  if(!preceptorMenu.contains(e.target) && !preceptorBtn.contains(e.target)){
    preceptorMenu.classList.add('hidden');
  }
});

/* ---------- Funciones comunes ---------- */
function fillYearSelect(selectEl){
  selectEl.innerHTML = '';
  YEARS.forEach(y => selectEl.appendChild(new Option(y.label, y.label)));
}
function fillCursoSelect(selectEl, añoLabel){
  selectEl.innerHTML = '';
  const y = YEARS.find(yy => yy.label === añoLabel);
  if(!y) return;
  y.cursos.forEach(c => selectEl.appendChild(new Option(c, c)));
}

/* ---------- Modal Reservar ---------- */
const modalReservar = document.getElementById('modalReservar');
const btnModalReservar = document.getElementById('btnModalReservar');
const resYear = document.getElementById('resYear');
const resCurso = document.getElementById('resCurso');
const resAlumno = document.getElementById('resAlumno');
const resTipo = document.getElementById('resTipo');
const cancelRes = document.getElementById('cancelRes');
const confirmRes = document.getElementById('confirmRes');

btnModalReservar.addEventListener('click', ()=>{
  preceptorMenu.classList.add('hidden');
  fillYearSelect(resYear);
  fillCursoSelect(resCurso, resYear.value);
  fillAlumnosReserva();
  modalReservar.classList.remove('hidden');
});
resYear.addEventListener('change', ()=> fillCursoSelect(resCurso, resYear.value));
resCurso.addEventListener('change', fillAlumnosReserva);

function fillAlumnosReserva(){
  const data = loadData();
  const key = `${resYear.value}-${resCurso.value}`;
  resAlumno.innerHTML = '';
  (data[key] || []).forEach(al => resAlumno.appendChild(new Option(al.nombre, al.nombre)));
}
cancelRes.addEventListener('click', ()=> modalReservar.classList.add('hidden'));
confirmRes.addEventListener('click', ()=>{
  const quien = 'Preceptor Ejemplo';
  const tipo = resTipo.value;
  const año = resYear.value;
  const curso = resCurso.value;
  const alumnoNombre = resAlumno.value;
  if(!alumnoNombre){ alert('Seleccione un alumno.'); return; }

  if(confirm('¿Está seguro de reservar el lugar?')){
    const data = loadData();
    const key = `${año}-${curso}`;
    const alumno = (data[key] || []).find(a=>a.nombre===alumnoNombre);
    if(alumno){
      alumno.reserva[tipo] = quien;
      saveData(data);
      renderAlumnos();
      modalReservar.classList.add('hidden');
      alert('Lugar reservado con éxito.');
    }
  }
});

/* ---------- Modal Agregar Alumno ---------- */
const modalAgregar = document.getElementById('modalAgregar');
const btnModalAgregar = document.getElementById('btnModalAgregar');
const addYear = document.getElementById('addYear');
const addCurso = document.getElementById('addCurso');
const addNombre = document.getElementById('addNombre');
const addDNI = document.getElementById('addDNI');
const addEmail = document.getElementById('addEmail');
const cancelAdd = document.getElementById('cancelAdd');
const confirmAdd = document.getElementById('confirmAdd');

btnModalAgregar.addEventListener('click', ()=>{
  preceptorMenu.classList.add('hidden');
  fillYearSelect(addYear);
  fillCursoSelect(addCurso, addYear.value);
  modalAgregar.classList.remove('hidden');
});
addYear.addEventListener('change', ()=> fillCursoSelect(addCurso, addYear.value));
cancelAdd.addEventListener('click', ()=> modalAgregar.classList.add('hidden'));

confirmAdd.addEventListener('click', ()=>{
  const año = addYear.value;
  const curso = addCurso.value;
  const nombre = addNombre.value.trim();
  const dni = addDNI.value.trim();
  const email = addEmail.value.trim();
  if(!nombre || !dni || !email){ alert('Complete todos los campos.'); return; }
  if(!confirm('¿Está seguro de agregar el alumno?')) return;

  const data = loadData();
  const key = `${año}-${curso}`;
  if(!data[key]) data[key] = [];
  data[key].push({
    nombre, dni, email,
    reserva: { Desayuno: null, Almuerzo: null, Merienda: null, Cena: null }
  });
  saveData(data);
  renderAlumnos();
  modalAgregar.classList.add('hidden');
  addNombre.value = addDNI.value = addEmail.value = '';
  alert('Alumno agregado con éxito.');
});

// Mostrar fecha de hoy
const fechaHoyEl = document.getElementById('fechaHoy');
const hoy = new Date();
fechaHoyEl.textContent = hoy.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });


/* ---------- Inicial ---------- */
renderAlumnos();