/* ==========================================================================
   Portafolio · Sebastian Truque
   - Agregar y eliminar ítems en cada sección
   - Todo se guarda en el navegador (localStorage), así que no se pierde al recargar
   - Tema claro / oscuro
   ========================================================================== */

(() => {
  "use strict";

  const CLAVE_DATOS = "portafolio-truque-datos";
  const CLAVE_TEMA = "portafolio-truque-tema";

  /* ------------------------------------------------------------------------
     CONTENIDO INICIAL
     Edita estos textos para cambiar lo que aparece por defecto.
     Cada sección es una lista de { titulo, detalle }.
     (Si ya abriste la página antes, pulsa "Restablecer contenido original"
     en el pie para ver los cambios que hagas aquí.)
     ------------------------------------------------------------------------ */
  const DATOS_INICIALES = {
    academico: [
      { titulo: "Colegio", detalle: "Basica secundaria, Colegio Juan de Ampudia" },
      {
        titulo: "Universidad",
        detalle: "Tecnologia en sistemas y Desarrollo de Software.",
      },
      { titulo: "SENA", detalle: "Titulo en integración de Multimedia" },
    ],
    laboral: [
      {
        titulo: "Estudiante",
        detalle: "Formación universitaria en curso, con proyectos prácticos.",
      },
      { titulo: "Asesor Progreser", detalle: "Asesoría y atención a clientes." },
    ],
    proyectos: [
      {
        titulo: "Truque Motos",
        detalle: "App Android hecha en Android Studio con Java para el curso de desarrollo móvil.",
      },
    ],
    habilidades: [
      { titulo: "Android Studio", detalle: "" },
      { titulo: "Java", detalle: "" },
      { titulo: "SQL", detalle: "" },
      { titulo: "Html", detalle: "" },
      { titulo: "Ser vago", detalle: "" },
    ],
  };

  /* ---------------------------- Estado y guardado ------------------------- */

  const clonar = (objeto) => JSON.parse(JSON.stringify(objeto));

  const esItemValido = (item) =>
    item && typeof item.titulo === "string" && item.titulo.trim() !== "";

  function cargarEstado() {
    const estado = clonar(DATOS_INICIALES);
    try {
      const crudo = localStorage.getItem(CLAVE_DATOS);
      if (!crudo) return estado;
      const guardado = JSON.parse(crudo);
      if (!guardado || typeof guardado !== "object") return estado;

      for (const clave of Object.keys(estado)) {
        if (Array.isArray(guardado[clave])) {
          estado[clave] = guardado[clave].filter(esItemValido).map((item) => ({
            titulo: item.titulo,
            detalle: typeof item.detalle === "string" ? item.detalle : "",
          }));
        }
      }
    } catch (error) {
    
    }
    return estado;
  }

  function guardarEstado() {
    try {
      localStorage.setItem(CLAVE_DATOS, JSON.stringify(estado));
    } catch (error) {
    
    }
  }

  let estado = cargarEstado();

  /* -------------------------------- Render -------------------------------- */

  function crearBotonEliminar(clave, indice, titulo) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "eliminar";
    boton.dataset.clave = clave;
    boton.dataset.indice = String(indice);
    boton.setAttribute("aria-label", "Eliminar " + titulo);
    boton.title = "Eliminar";
    boton.textContent = "×";
    return boton;
  }

  function crearItem(clave, item, indice, tipo, esNuevo) {
    const li = document.createElement("li");

    if (tipo === "chips") {
      li.className = "chip";
      const texto = document.createElement("span");
      texto.textContent = item.titulo;
      li.append(texto, crearBotonEliminar(clave, indice, item.titulo));
    } else {
      li.className = "item";
      const cuerpo = document.createElement("div");
      cuerpo.className = "item-cuerpo";

      const titulo = document.createElement("p");
      titulo.className = "item-titulo";
      titulo.textContent = item.titulo;
      cuerpo.append(titulo);

      if (item.detalle) {
        const detalle = document.createElement("p");
        detalle.className = "item-detalle";
        detalle.textContent = item.detalle;
        cuerpo.append(detalle);
      }
      li.append(cuerpo, crearBotonEliminar(clave, indice, item.titulo));
    }

    if (esNuevo) li.classList.add("nuevo");
    return li;
  }

  function render(clave, indiceNuevo = -1) {
    const lista = document.querySelector('[data-lista="' + clave + '"]');
    if (!lista) return;
    const tipo = lista.dataset.tipo;

    lista.replaceChildren();

    if (estado[clave].length === 0) {
      const vacio = document.createElement("li");
      vacio.className = "vacio";
      vacio.textContent = "Aún no hay nada aquí. Escribe abajo el primero y pulsa Agregar.";
      lista.append(vacio);
      return;
    }

    estado[clave].forEach((item, indice) => {
      lista.append(crearItem(clave, item, indice, tipo, indice === indiceNuevo));
    });
  }

  const renderTodo = () => Object.keys(estado).forEach((clave) => render(clave));

  /* ----------------------------- Agregar ítems ---------------------------- */

  function marcarError(input) {
    if (!input.dataset.placeholderOriginal) {
      input.dataset.placeholderOriginal = input.placeholder;
    }
    input.placeholder = "Escribe algo antes de agregar";
    input.classList.remove("error");
    void input.offsetWidth; // reinicia la animación si ya estaba activa
    input.classList.add("error");

    setTimeout(() => {
      input.classList.remove("error");
      input.placeholder = input.dataset.placeholderOriginal;
    }, 1600);
  }

  document.querySelectorAll("form.agregar").forEach((formulario) => {
    formulario.addEventListener("submit", (evento) => {
      evento.preventDefault();

      const clave = formulario.dataset.form;
      const campoTitulo = formulario.elements.titulo;
      const campoDetalle = formulario.elements.detalle; // no existe en el formulario de habilidades

      const titulo = campoTitulo.value.trim();
      const detalle = campoDetalle ? campoDetalle.value.trim() : "";

      if (!titulo) {
        marcarError(campoTitulo);
        campoTitulo.focus();
        return;
      }

      estado[clave].push({ titulo, detalle });
      guardarEstado();
      render(clave, estado[clave].length - 1);

      formulario.reset();
      campoTitulo.focus();
    });

    // Al escribir, se quita el aviso de error
    formulario.addEventListener("input", (evento) => {
      if (evento.target.classList.contains("error")) {
        evento.target.classList.remove("error");
        evento.target.placeholder = evento.target.dataset.placeholderOriginal || "";
      }
    });
  });

  /* ------------------------------ Eliminar ítems -------------------------- */

  document.addEventListener("click", (evento) => {
    const boton = evento.target.closest(".eliminar");
    if (!boton) return;

    const clave = boton.dataset.clave;
    const indice = Number(boton.dataset.indice);
    estado[clave].splice(indice, 1);
    guardarEstado();
    render(clave);

    // Con teclado (detail === 0) el foco pasa al ítem vecino para no perder el lugar
    if (evento.detail === 0) {
      const lista = document.querySelector('[data-lista="' + clave + '"]');
      const botones = lista.querySelectorAll(".eliminar");
      const siguiente = botones[indice] || botones[indice - 1];
      const destino = siguiente || document.querySelector('[data-form="' + clave + '"] input');
      if (destino) destino.focus();
    }
  });

  /* --------------------------------- Tema --------------------------------- */

  const raiz = document.documentElement;
  const botonTema = document.getElementById("btn-tema");

  botonTema.addEventListener("click", () => {
    const nuevo = raiz.dataset.tema === "oscuro" ? "claro" : "oscuro";
    raiz.dataset.tema = nuevo;
    try {
      localStorage.setItem(CLAVE_TEMA, nuevo);
    } catch (error) {
      /* sin almacenamiento: el tema solo dura hasta recargar */
    }
  });

  /* --------------------------- Restablecer y pie -------------------------- */

  document.getElementById("btn-reset").addEventListener("click", () => {
    const confirmado = window.confirm(
      "¿Restablecer el contenido original? Se borrarán los ítems que agregaste o eliminaste."
    );
    if (!confirmado) return;

    try {
      localStorage.removeItem(CLAVE_DATOS);
    } catch (error) {
      /* nada que hacer */
    }
    estado = clonar(DATOS_INICIALES);
    renderTodo();
  });

  document.getElementById("anio").textContent = new Date().getFullYear();

  /* --------------------------------- Inicio -------------------------------- */

  renderTodo();
})();