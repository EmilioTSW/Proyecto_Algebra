const mensaje = document.getElementById('mensaje');
const charCount = document.querySelector('.char-count');
const matrizMensaje = document.getElementById('matrizMensaje');
const k11 = document.getElementById('k11');
const k12 = document.getElementById('k12');
const k21 = document.getElementById('k21');
const k22 = document.getElementById('k22');
const btnEncriptar = document.getElementById('encriptar');
const btnDesencriptar = document.getElementById('desencriptar'); // <-- agregado
const resultado = document.getElementById('resultado');

// Actualizar contador de caracteres
mensaje.addEventListener('input', () => {
    const len = mensaje.value.length;
    charCount.textContent = `${len}/30`;
    mostrarMatrizMensaje();
});

// Mostrar matriz del mensaje
function mostrarMatrizMensaje() {
    const texto = mensaje.value.toUpperCase().replace(/[^A-Z]/g, '');
    
    if (texto.length === 0) {
        matrizMensaje.textContent = 'Escribe un mensaje primero...';
        return;
    }
    
    const valores = texto.split('').map(char => char.charCodeAt(0) - 65);
    
    // Agrupar en pares
    let matriz = '[';
    for (let i = 0; i < valores.length; i += 2) {
        if (i > 0) matriz += ' ';
        matriz += '[' + valores[i];
        if (i + 1 < valores.length) {
            matriz += ', ' + valores[i + 1];
        } else {
            matriz += ', ' + (valores.length % 2 === 0 ? '' : '23'); // Padding con 'X'
        }
        matriz += ']';
    }
    matriz += ']';
    
    matrizMensaje.textContent = matriz;
}

// Función de encriptación Hill
btnEncriptar.addEventListener('click', () => {
    // Validar inputs
    const key = [
        [parseInt(k11.value) || 0, parseInt(k12.value) || 0],
        [parseInt(k21.value) || 0, parseInt(k22.value) || 0]
    ];
    
    if (key[0][0] === 0 && key[0][1] === 0 && key[1][0] === 0 && key[1][1] === 0) {
        resultado.textContent = 'Error: Ingresa una matriz clave válida';
        resultado.classList.add('error');
        return;
    }
    
    const texto = mensaje.value.toUpperCase().replace(/[^A-Z]/g, '');
    
    if (texto.length === 0) {
        resultado.textContent = 'Error: Ingresa un mensaje';
        resultado.classList.add('error');
        return;
    }
    
    // Calcular determinante
    const det = (key[0][0] * key[1][1] - key[0][1] * key[1][0]) % 26;
    
    if (det === 0) {
        resultado.textContent = 'Error: La matriz no es invertible (determinante = 0)';
        resultado.classList.add('error');
        return;
    }
    
    // Convertir texto a números
    let numeros = texto.split('').map(char => char.charCodeAt(0) - 65);
    
    // Agregar padding si es impar
    if (numeros.length % 2 !== 0) {
        numeros.push(23); // 'X'
    }
    
    // Encriptar
    let encriptado = '';
    for (let i = 0; i < numeros.length; i += 2) {
        const v1 = numeros[i];
        const v2 = numeros[i + 1];
        
        const c1 = (key[0][0] * v1 + key[0][1] * v2) % 26;
        const c2 = (key[1][0] * v1 + key[1][1] * v2) % 26;
        
        encriptado += String.fromCharCode(65 + c1);
        encriptado += String.fromCharCode(65 + c2);
    }
    
    resultado.classList.remove('error');
    resultado.textContent = encriptado;
});


//   DESENCRIPTAR  

// Función auxiliar para módulo (evita negativos)
function mod(n, m) {
    return ((n % m) + m) % m;
}

// Calcular determinante 2x2 mod 26
function det2x2(mat) {
    return mod(mat[0][0] * mat[1][1] - mat[0][1] * mat[1][0], 26);
}

// Hallar inverso multiplicativo de un número mod 26
function inversoMod26(a) {
    a = mod(a, 26);
    for (let i = 1; i < 26; i++) {
        if (mod(a * i, 26) === 1) return i;
    }
    return null;
}

// Calcular matriz inversa de la clave (2x2) mod 26
function matrizInversa(key) {
    const det = det2x2(key);
    const detInv = inversoMod26(det);

    if (detInv === null) return null;

    const a = key[0][0], b = key[0][1];
    const c = key[1][0], d = key[1][1];

    // Inversa 2x2: (1/det) * [[d, -b], [-c, a]] mod 26
    return [
        [mod(detInv * d, 26), mod(detInv * -b, 26)],
        [mod(detInv * -c, 26), mod(detInv * a, 26)]
    ];
}

btnDesencriptar.addEventListener('click', () => {
    resultado.classList.remove('error');

    const key = [
        [parseInt(k11.value) || 0, parseInt(k12.value) || 0],
        [parseInt(k21.value) || 0, parseInt(k22.value) || 0]
    ];

    const textoCifrado = resultado.textContent.toUpperCase().replace(/[^A-Z]/g, '');

    if (textoCifrado.length === 0) {
        resultado.textContent = 'Error: No hay texto cifrado en el resultado';
        resultado.classList.add('error');
        return;
    }

    if (textoCifrado.length % 2 !== 0) {
        resultado.textContent = 'Error: El texto cifrado debe tener longitud par';
        resultado.classList.add('error');
        return;
    }

    const invKey = matrizInversa(key);

    if (!invKey) {
        resultado.textContent = 'Error: La matriz clave NO es invertible modulo 26';
        resultado.classList.add('error');
        return;
    }

    let numeros = textoCifrado.split('').map(c => c.charCodeAt(0) - 65);
    let textoPlano = '';

    for (let i = 0; i < numeros.length; i += 2) {
        const c1 = numeros[i];
        const c2 = numeros[i + 1];

        const p1 = mod(invKey[0][0] * c1 + invKey[0][1] * c2, 26);
        const p2 = mod(invKey[1][0] * c1 + invKey[1][1] * c2, 26);

        textoPlano += String.fromCharCode(65 + p1);
        textoPlano += String.fromCharCode(65 + p2);
    }

    // Quitar posible padding 'X' al final
    if (textoPlano.endsWith('X')) {
        textoPlano = textoPlano.slice(0, -1);
    }

    resultado.textContent = textoPlano;
});
