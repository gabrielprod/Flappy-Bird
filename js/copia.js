// FLAPPY

//CRIA UM NOVO ELEMENTO
function novoElemento(nomedatag, nomedaclasse) {
    const elem = document.createElement(nomedatag)
    elem.className = nomedaclasse

    return elem
}

//FUNÇÃO CONTRUTORA QUE PROMOVE A CRIAÇÃO DE BARREIRAS
function Barreira(reverso = false) {
    this.element = novoElemento('div', 'barreira')

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')

    this.element.appendChild(reverso ? corpo : borda)
    this.element.appendChild(reverso ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`


}

function ParDeBarreiras(altura, abertura, x) {
    this.element = novoElemento('div', 'par-de-barreiras')

    //instanciando elemento com o operador new passando elementos/metodos da funcao construtora
    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.element.appendChild(this.superior.element)
    this.element.appendChild(this.inferior.element)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior

        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)

    }

    // EM QUE POSICAO A AS BARREIRA SE ENCONTRAM
    this.getX = () => parseInt(this.element.style.left.split('px')[0])
    this.setX = x => this.element.style.left = `${x}px`
    this.getlargura = () => this.element.clientWidth

    this.sortearAbertura()
    this.setX(x)
}

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            // quando o elemento sair da área do game
            if (par.getX() < -par.getlargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }
            const meio = largura / 2
            const cruzouMeio = par.getX() + deslocamento >= meio && par.getX() < meio
            if (cruzouMeio) {
                notificarPonto()
            }
        })
    }
}

function Passaro(alturaJogo) {
    let voando = false

    this.element = novoElemento('img', 'passaro')
    this.element.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
    this.setY = y => this.element.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5)
        const alturaMaxima = alturaJogo - this.element.clientHeight

        if (novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
    }

    this.setY(alturaJogo / 2)

}

function Progresso() {
    this.element = novoElemento('span', 'progresso')
    this.atualizarPonto = pontos => {
        this.element.innerHTML = pontos
    }
    this.atualizarPonto(0)
}

function estaoSobrepostos(elementA, elementB) {
    const a = elementA.getBoundingClientRect() // Retangulo associado a variavel
    const b = elementB.getBoundingClientRect()

    const horinzontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

    return horinzontal && vertical

}

function colidiu(passaro, bar) {
    let colidiu = false

    bar.pares.forEach(ParDeBarreiras => {
        if (!colidiu) {
            const superior = ParDeBarreiras.superior.element
            const inferior = ParDeBarreiras.inferior.element

            colidiu = estaoSobrepostos(passaro.element, superior) || estaoSobrepostos(passaro.element, inferior)
        }
    })

    return colidiu
}

function FlappyBird() {
    let pontos = 0

    const areadoJogo = document.querySelector('[wm-flappy]')
    const altura = areadoJogo.clientHeight
    const largura = areadoJogo.clientWidth

    const progresso = new Progresso()
    const bar = new Barreiras(altura, largura, 250, 400, () => { progresso.atualizarPonto(++pontos) })
    const passaro = new Passaro(altura)

    areadoJogo.appendChild(progresso.element)
    areadoJogo.appendChild(passaro.element)
    bar.pares.forEach(par => areadoJogo.appendChild(par.element))

    this.start = () => {
        const temp = setInterval(() => {
            bar.animar()
            passaro.animar()

            if (colidiu(passaro, bar)) {
                clearInterval(temp)

                const lose = document.querySelector('.lose')
                lose.style.position = 'absolute'
                lose.style.top = '40%'
                lose.style.left = '50%'
                lose.style.border = 'solid 3px white'

                lose.style.background = 'linear-gradient(#345dc2,#2a2e38)'
                lose.style.textAlign = 'center'
                lose.innerHTML = `Score<br>Points:${pontos}`


            }
        }, 20);

    }

}

new FlappyBird().start()