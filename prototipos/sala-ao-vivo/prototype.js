export const SCENARIOS = Object.freeze({
  'invite-validating': Object.freeze({
    label: 'Convite · validando',
    roles: ['participant'],
    heading: 'Validando convite…',
    message: 'Estamos conferindo o acesso antes de pedir seu nome.',
    tone: 'neutral',
    captionAvailable: false,
    mutationsAllowed: false,
    primaryAction: null,
  }),
  'invite-unavailable': Object.freeze({
    label: 'Convite · indisponível',
    roles: ['participant'],
    heading: 'Este convite não está disponível',
    message: 'A reunião pode ter sido encerrada ou o link não é válido.',
    tone: 'danger',
    captionAvailable: false,
    mutationsAllowed: false,
    primaryAction: 'Voltar ao início',
  }),
  'meeting-connecting': Object.freeze({
    label: 'Reunião · entrando',
    roles: ['host', 'participant'],
    heading: 'Entrando na reunião…',
    message: 'Conectando com segurança.',
    tone: 'neutral',
    captionAvailable: false,
    mutationsAllowed: false,
    primaryAction: null,
  }),
  'meeting-reconnecting': Object.freeze({
    label: 'Reunião · reconectando',
    roles: ['host', 'participant'],
    heading: 'Reconectando…',
    message: 'A legenda atual continua disponível. Novas mensagens podem atrasar.',
    tone: 'warning',
    captionAvailable: true,
    mutationsAllowed: false,
    primaryAction: 'Tentar agora',
  }),
  'live-empty': Object.freeze({
    label: 'Ao vivo · sem texto',
    roles: ['host', 'participant'],
    heading: 'Aguardando a primeira fala',
    message: 'A reunião está ao vivo; a transcrição ainda não publicou texto.',
    tone: 'neutral',
    captionAvailable: true,
    mutationsAllowed: true,
    primaryAction: null,
  }),
  'mic-requesting': Object.freeze({
    label: 'Microfone · pedindo permissão',
    roles: ['host'],
    heading: 'Permita o microfone',
    message: 'O áudio só será usado pelo reconhecedor escolhido.',
    tone: 'warning',
    captionAvailable: true,
    mutationsAllowed: true,
    primaryAction: 'Ver como liberar',
  }),
  'mic-denied': Object.freeze({
    label: 'Microfone · bloqueado',
    roles: ['host'],
    heading: 'Microfone bloqueado',
    message: 'Libere a permissão deste site e tente novamente.',
    tone: 'danger',
    captionAvailable: true,
    mutationsAllowed: true,
    primaryAction: 'Tentar novamente',
  }),
  'local-model-preparing': Object.freeze({
    label: 'Transcrição · preparando modelo',
    roles: ['host'],
    heading: 'Preparando transcrição em português',
    message: 'Reunião e chat continuam disponíveis.',
    tone: 'info',
    captionAvailable: true,
    mutationsAllowed: true,
    primaryAction: null,
  }),
  'local-audio-without-text': Object.freeze({
    label: 'Transcrição · voz sem texto',
    roles: ['host'],
    heading: 'Voz detectada, aguardando texto',
    message: 'Confira a entrada se nenhuma frase aparecer.',
    tone: 'warning',
    captionAvailable: true,
    mutationsAllowed: true,
    primaryAction: 'Conferir microfone',
  }),
  'live-literal': Object.freeze({
    label: 'Ao vivo · literal',
    roles: ['host', 'participant'],
    heading: 'Transcrição literal ao vivo',
    message: 'Texto reconhecido sem adaptação de IA.',
    tone: 'success',
    captionAvailable: true,
    mutationsAllowed: true,
    primaryAction: null,
  }),
  'live-adapted': Object.freeze({
    label: 'Ao vivo · adaptada',
    roles: ['host', 'participant'],
    heading: 'Modo adaptado ao vivo',
    message: 'Você vê a apresentação adaptada; o literal segue disponível.',
    tone: 'success',
    captionAvailable: true,
    mutationsAllowed: true,
    primaryAction: 'Ver literal',
  }),
  'ai-unavailable-literal-fallback': Object.freeze({
    label: 'IA · fallback literal',
    roles: ['host', 'participant'],
    heading: 'Modo adaptado temporariamente indisponível',
    message: 'Você continua vendo a transcrição literal.',
    tone: 'warning',
    captionAvailable: true,
    mutationsAllowed: true,
    primaryAction: 'Tentar modo adaptado',
  }),
  'meeting-ended-readonly': Object.freeze({
    label: 'Reunião · encerrada',
    roles: ['host', 'participant'],
    heading: 'Reunião encerrada',
    message: 'Transcrição e chat estão disponíveis somente para leitura.',
    tone: 'neutral',
    captionAvailable: true,
    mutationsAllowed: false,
    primaryAction: 'Voltar às reuniões',
  }),
  'action-error': Object.freeze({
    label: 'Ação · erro recuperável',
    roles: ['host', 'participant'],
    heading: 'Não foi possível concluir a ação',
    message: 'A reunião continua ativa; tente novamente.',
    tone: 'danger',
    captionAvailable: true,
    mutationsAllowed: true,
    primaryAction: 'Tentar novamente',
  }),
})

const VARIANTS = new Set(['stage', 'focus'])
const ROLES = new Set(['host', 'participant'])
const PANELS = new Set(['chat', 'people', 'context', 'preferences', 'audio-help', 'actions'])
const CAPTION_PRESETS = ['compact', 'standard', 'large']

function safeOption(params, key, allowed, fallback) {
  const value = params.get(key)
  return value && allowed.has(value) ? value : fallback
}

export function parsePrototypeOptions(params) {
  const variant = safeOption(params, 'variant', VARIANTS, 'stage')
  const role = safeOption(params, 'role', ROLES, 'host')
  const requestedState = params.get('state')
  const scenario = requestedState ? SCENARIOS[requestedState] : null
  const state = scenario?.roles.includes(role) ? requestedState : 'live-empty'
  const requestedPanel = safeOption(params, 'panel', PANELS, null)
  const panel = role === 'participant' && ['context', 'audio-help'].includes(requestedPanel)
    ? null
    : requestedPanel

  return { variant, role, state, panel }
}

export function adjustCaptionPreset(current, direction) {
  const currentIndex = Math.max(0, CAPTION_PRESETS.indexOf(current))
  const nextIndex = Math.min(
    CAPTION_PRESETS.length - 1,
    Math.max(0, currentIndex + Math.sign(direction)),
  )
  return CAPTION_PRESETS[nextIndex]
}

export function buildPrototypeUrl(baseUrl, options) {
  const url = new URL(baseUrl)
  url.search = ''
  url.searchParams.set('variant', options.variant)
  url.searchParams.set('role', options.role)
  url.searchParams.set('state', options.state)
  if (options.panel) url.searchParams.set('panel', options.panel)
  return url.toString()
}

const PANEL_COPY = Object.freeze({
  chat: ['Durante a reunião', 'Chat da reunião'],
  people: ['Presença', 'Pessoas na sala'],
  context: ['Proposta · Card 04', 'Contexto da plateia'],
  preferences: ['Preferência individual', 'Como você lê a legenda'],
  'audio-help': ['Privado neste navegador', 'Entrada de áudio'],
  actions: ['Controles secundários', 'Mais ações'],
})

function createElement(tag, attributes = {}, children = []) {
  const node = document.createElement(tag)
  for (const [name, value] of Object.entries(attributes)) {
    if (value === null || value === undefined) continue
    if (name === 'className') node.className = value
    else if (name === 'text') node.textContent = value
    else if (name === 'dataset') Object.assign(node.dataset, value)
    else if (name.startsWith('aria-')) node.setAttribute(name, value)
    else if (name in node) node[name] = value
    else node.setAttribute(name, value)
  }
  for (const child of children) {
    if (child) node.append(child)
  }
  return node
}

function createIcon(symbol) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use')
  svg.setAttribute('aria-hidden', 'true')
  use.setAttribute('href', `#icon-${symbol}`)
  svg.append(use)
  return svg
}

function initPrototype() {
  let options = parsePrototypeOptions(new URLSearchParams(location.search))
  let captionPreset = 'standard'
  let panelTrigger = null
  let inviteTimer = null
  const dialogTriggers = new WeakMap()

  const body = document.body
  const meetingShell = document.querySelector('#meeting-shell')
  const entranceShell = document.querySelector('#entrance-shell')
  const entranceTitle = document.querySelector('#entrance-title')
  const entranceMessage = document.querySelector('#entrance-message')
  const entranceKicker = document.querySelector('#entrance-kicker')
  const inviteProgress = document.querySelector('#invite-progress')
  const joinForm = document.querySelector('#join-form')
  const guestName = document.querySelector('#guest-name')
  const entranceAction = document.querySelector('#entrance-primary-action')
  const consoleElement = document.querySelector('#prototype-console')
  const variantSelect = document.querySelector('#prototype-variant')
  const roleSelect = document.querySelector('#prototype-role')
  const stateSelect = document.querySelector('#prototype-state')
  const meetingPresence = document.querySelector('#meeting-presence')
  const meetingPresenceLabel = document.querySelector('#meeting-presence-label')
  const meetingSubtitle = document.querySelector('#meeting-subtitle')
  const captionStatusLabel = document.querySelector('#caption-status-label')
  const stateNotice = document.querySelector('#state-notice')
  const stateKicker = document.querySelector('#state-kicker')
  const stateHeading = document.querySelector('#state-heading')
  const stateMessage = document.querySelector('#state-message')
  const stateIconUse = document.querySelector('#state-icon-use')
  const statePrimaryAction = document.querySelector('#state-primary-action')
  const captionFlow = document.querySelector('#caption-flow')
  const captionModeLabel = document.querySelector('#caption-mode-label')
  const currentCaption = document.querySelector('#current-caption')
  const partialCaption = document.querySelector('#partial-caption')
  const captionAnnouncer = document.querySelector('#caption-announcer')
  const returnLiveButton = document.querySelector('#return-live-button')
  const transcriptionButton = document.querySelector('#transcription-button')
  const meetingStatusText = document.querySelector('#meeting-status-text')
  const modeButtons = [...document.querySelectorAll('[data-caption-mode]')]
  const meetingPanel = document.querySelector('#meeting-panel')
  const panelTitle = document.querySelector('#panel-title')
  const panelKicker = document.querySelector('#panel-kicker')
  const panelContent = document.querySelector('#panel-content')
  const inviteDialog = document.querySelector('#invite-dialog')
  const leaveDialog = document.querySelector('#leave-dialog')
  const endDialog = document.querySelector('#end-dialog')
  const copyFeedback = document.querySelector('#copy-feedback')
  const inviteLink = document.querySelector('#invite-link')
  const raiseHandButton = document.querySelector('#raise-hand-button')
  const raiseHandState = document.querySelector('#raise-hand-state')

  const panelButtons = Object.freeze({
    chat: document.querySelector('#chat-button'),
    people: document.querySelector('#people-button'),
    context: document.querySelector('#context-button'),
    preferences: document.querySelector('#reading-preferences-button'),
    'audio-help': document.querySelector('#audio-help-button'),
    actions: document.querySelector('#more-button'),
  })

  function allowedScenarios(role) {
    return Object.entries(SCENARIOS).filter(([, scenario]) => scenario.roles.includes(role))
  }

  function updatePrototypeUrl() {
    history.replaceState(null, '', buildPrototypeUrl(location.href, options))
  }

  function setOptions(nextOptions, { updateUrl = true } = {}) {
    options = { ...options, ...nextOptions }
    const scenario = SCENARIOS[options.state]
    if (!scenario?.roles.includes(options.role)) options.state = 'live-empty'
    if (options.role === 'participant' && ['context', 'audio-help'].includes(options.panel)) {
      options.panel = null
    }
    if (updateUrl) updatePrototypeUrl()
    render()
  }

  function renderScenarioSelect() {
    const optionsForRole = allowedScenarios(options.role).map(([key, scenario]) =>
      createElement('option', { value: key, text: scenario.label }),
    )
    stateSelect.replaceChildren(...optionsForRole)
    stateSelect.value = options.state
  }

  function renderEntrance(scenario) {
    const unavailable = options.state === 'invite-unavailable'
    clearTimeout(inviteTimer)
    entranceKicker.textContent = unavailable ? 'Não foi possível entrar' : 'Convite para sala ao vivo'
    entranceTitle.textContent = scenario.heading
    entranceMessage.textContent = scenario.message
    inviteProgress.hidden = unavailable
    joinForm.hidden = true
    entranceAction.hidden = !unavailable
    entranceAction.textContent = scenario.primaryAction ?? ''

    if (!unavailable) {
      inviteTimer = setTimeout(() => {
        inviteProgress.hidden = true
        entranceKicker.textContent = 'Convite verificado'
        entranceTitle.textContent = 'Você foi convidado para uma conversa'
        entranceMessage.textContent = 'Entre com seu nome. A legenda aparece assim que você chega.'
        joinForm.hidden = false
        guestName.focus({ preventScroll: true })
      }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650)
    }
  }

  function scenarioStatusLabel(state) {
    if (state === 'meeting-ended-readonly') return 'Encerrada'
    if (state === 'meeting-reconnecting') return 'Reconectando'
    if (state === 'meeting-connecting') return 'Conectando'
    if (state === 'mic-denied') return 'Microfone bloqueado'
    if (state === 'local-model-preparing') return 'Preparando'
    if (state === 'local-audio-without-text') return 'Voz detectada'
    if (state === 'live-literal') return 'Literal ao vivo'
    if (state === 'live-adapted') return 'Adaptada ao vivo'
    if (state === 'ai-unavailable-literal-fallback') return 'Literal em fallback'
    return 'Disponível'
  }

  function scenarioKicker(state) {
    if (state.startsWith('mic-')) return 'Permissão de áudio'
    if (state.startsWith('local-')) return 'Transcrição local'
    if (state.startsWith('ai-')) return 'Adaptação de leitura'
    if (state === 'meeting-reconnecting') return 'Conexão instável'
    if (state === 'meeting-ended-readonly') return 'Somente leitura'
    if (state === 'action-error') return 'Ação preservada'
    return 'Sala ao vivo'
  }

  function scenarioIcon(state) {
    if (state === 'mic-denied' || state === 'action-error') return '#icon-alert'
    if (state === 'meeting-ended-readonly') return '#icon-stop'
    if (state === 'live-literal' || state === 'live-adapted') return '#icon-check'
    return '#icon-wave'
  }

  function renderCaptionCopy(state) {
    const adapted = state === 'live-adapted'
    const fallback = state === 'ai-unavailable-literal-fallback'
    const ended = state === 'meeting-ended-readonly'

    captionModeLabel.textContent = adapted ? 'Transcrição adaptada' : 'Transcrição literal'
    currentCaption.textContent = adapted
      ? 'A legenda fica no centro. As preferências mudam apenas para você.'
      : ended
        ? 'O encontro terminou. Este conteúdo permanece disponível para leitura.'
        : fallback
          ? 'A adaptação parou, mas o texto literal continua disponível.'
          : 'O texto permanece no centro da experiência.'
    partialCaption.hidden = ended || fallback
    modeButtons.forEach((button) => {
      const pressed = button.dataset.captionMode === (adapted ? 'adapted' : 'literal')
      button.setAttribute('aria-pressed', String(pressed))
    })
  }

  function renderMeeting(scenario) {
    const state = options.state
    const isEnded = state === 'meeting-ended-readonly'
    const isConnecting = state === 'meeting-connecting'
    const showCaptionFlow = scenario.captionAvailable && state !== 'live-empty'
    const showStateNotice = !['live-literal', 'live-adapted'].includes(state)
    const transcribing = ['live-literal', 'live-adapted', 'ai-unavailable-literal-fallback', 'local-audio-without-text'].includes(state)

    meetingPresence.dataset.connection = isEnded
      ? 'ended'
      : state === 'meeting-reconnecting'
        ? 'reconnecting'
        : isConnecting
          ? 'connecting'
          : 'live'
    meetingPresenceLabel.textContent = isEnded
      ? 'Encerrada'
      : state === 'meeting-reconnecting'
        ? 'Reconectando'
        : isConnecting
          ? 'Conectando'
          : 'Ao vivo'
    meetingSubtitle.textContent = isEnded
      ? 'Conteúdo em somente leitura'
      : `${options.role === 'host' ? 'Você é anfitrião' : 'Você entrou por convite'} · 3 pessoas`

    captionStatusLabel.textContent = scenarioStatusLabel(state)
    panelButtons.preferences.querySelector('strong').textContent = state === 'live-adapted'
      ? 'Leitura adaptada'
      : 'Leitura literal'
    stateNotice.hidden = !showStateNotice
    stateNotice.dataset.tone = scenario.tone
    stateNotice.dataset.overlay = String(showCaptionFlow)
    stateNotice.setAttribute('role', scenario.tone === 'danger' ? 'alert' : 'status')
    stateKicker.textContent = scenarioKicker(state)
    stateHeading.textContent = scenario.heading
    stateMessage.textContent = scenario.message
    stateIconUse.setAttribute('href', scenarioIcon(state))
    statePrimaryAction.hidden = !scenario.primaryAction
    statePrimaryAction.textContent = scenario.primaryAction ?? ''

    captionFlow.hidden = !showCaptionFlow
    renderCaptionCopy(state)

    body.dataset.transcribing = String(transcribing && !isEnded)
    const transcriptLabel = transcribing ? 'Pausar transcrição' : 'Iniciar transcrição'
    transcriptionButton.setAttribute('aria-label', transcriptLabel)
    transcriptionButton.querySelector('strong').textContent = transcriptLabel
    transcriptionButton.querySelector('small').textContent = transcribing ? 'Texto sendo publicado' : 'Microfone pausado'

    meetingStatusText.textContent = isEnded
      ? 'Reunião encerrada. Conteúdo disponível somente para leitura.'
      : state === 'meeting-reconnecting'
        ? 'Reconectando. O texto atual permanece disponível.'
        : transcribing
          ? 'Reunião ao vivo. A transcrição está ativa.'
          : 'Reunião ao vivo. A transcrição está pausada.'

    if (isEnded && meetingPanel.open && ['context', 'audio-help', 'actions'].includes(options.panel)) {
      closePanel({ restoreFocus: false })
    }
  }

  function render() {
    const scenario = SCENARIOS[options.state]
    const isEntrance = options.state.startsWith('invite-')
    body.dataset.variant = options.variant
    body.dataset.role = options.role
    body.dataset.state = options.state
    body.dataset.captionSize = captionPreset
    variantSelect.value = options.variant
    roleSelect.value = options.role
    renderScenarioSelect()

    entranceShell.hidden = !isEntrance
    meetingShell.hidden = isEntrance
    if (isEntrance) renderEntrance(scenario)
    else renderMeeting(scenario)

    if (!isEntrance && options.panel && !meetingPanel.open) {
      const trigger = panelButtons[options.panel] ?? null
      queueMicrotask(() => openPanel(options.panel, trigger, { updateUrl: false }))
    }
  }

  function makeAvatar(initials, tone = 'teal') {
    return createElement('span', {
      className: 'avatar',
      text: initials,
      dataset: { tone },
      'aria-hidden': 'true',
    })
  }

  function renderChatPanel() {
    const messages = createElement('div', { className: 'chat-messages' })
    for (const message of [
      ['CM', 'Carla', '10:41', 'O link abriu direto na legenda.'],
      ['RF', 'Rafael', '10:42', 'Ótimo. Vou compartilhar a próxima referência aqui.'],
    ]) {
      const meta = createElement('div', { className: 'chat-message__meta' }, [
        createElement('strong', { text: message[1] }),
        createElement('time', { text: message[2] }),
      ])
      const bodyNode = createElement('div', { className: 'chat-message__body' }, [
        meta,
        createElement('p', { text: message[3] }),
      ])
      messages.append(createElement('article', { className: 'chat-message' }, [makeAvatar(message[0]), bodyNode]))
    }

    const composer = createElement('form', { className: 'chat-composer', dataset: { mutationControl: '' } }, [
      createElement('input', { placeholder: 'Escreva uma mensagem…', 'aria-label': 'Mensagem' }),
      createElement('button', { type: 'submit', text: 'Enviar' }),
    ])
    composer.addEventListener('submit', (event) => {
      event.preventDefault()
      const input = composer.querySelector('input')
      if (!input.value.trim()) return
      input.value = ''
      captionAnnouncer.textContent = 'Mensagem simulada enviada no protótipo.'
    })

    return createElement('div', { className: 'chat-layout' }, [messages, composer])
  }

  function renderPeoplePanel() {
    const list = createElement('ul', { className: 'people-list' })
    const people = [
      ['CM', 'Carla Machado', 'Anfitriã'],
      ['RF', 'Rafael Freitas', 'Participante'],
      ['VC', 'Você', options.role === 'host' ? 'Anfitrião' : 'Convidado'],
    ]
    for (const [initials, name, role] of people) {
      const copy = createElement('span', { className: 'person-row__copy' }, [
        createElement('strong', { text: name }),
        createElement('small', { text: 'Na sala agora' }),
      ])
      list.append(createElement('li', { className: 'person-row' }, [
        makeAvatar(initials),
        copy,
        createElement('span', { className: 'person-role', text: role }),
      ]))
    }
    return list
  }

  function renderContextPanel() {
    const callout = createElement('div', { className: 'proposal-callout' }, [
      createIcon('context'),
      createElement('span', { text: 'Proposta do Card 04. Este formulário não persiste dados.' }),
    ])
    const audience = createElement('label', { className: 'panel-field', text: 'Quem acompanha esta conversa?' })
    audience.append(createElement('input', { value: 'Equipe de produto e acessibilidade' }))
    const goal = createElement('label', { className: 'panel-field', text: 'O que precisa ficar claro?' })
    goal.append(createElement('textarea', { placeholder: 'Ex.: explicar o novo fluxo sem jargões.' }))
    const save = createElement('button', { className: 'button button--primary', type: 'button', text: 'Aplicar contexto', dataset: { mutationControl: '' } })
    save.addEventListener('click', () => {
      captionAnnouncer.textContent = 'Contexto simulado aplicado sem interromper a reunião.'
    })
    return createElement('form', { className: 'panel-form' }, [
      createElement('p', { className: 'panel-intro', text: 'Contexto opcional para orientar futuras adaptações. A reunião já está ao vivo.' }),
      callout,
      audience,
      goal,
      save,
    ])
  }

  function renderPreferencesPanel() {
    const modeOptions = createElement('div', { className: 'preference-options' })
    for (const [value, label] of [['literal', 'Literal'], ['adapted', 'Adaptada']]) {
      const button = createElement('button', {
        type: 'button',
        text: label,
        'aria-pressed': String(options.state === `live-${value}`),
      })
      button.addEventListener('click', () => setOptions({ state: `live-${value}` }))
      modeOptions.append(button)
    }
    const modeCard = createElement('div', { className: 'preference-card' }, [
      createElement('strong', { text: 'Modo de leitura' }),
      createElement('p', { text: 'A escolha muda somente sua apresentação. Adaptada é uma proposta futura.' }),
      modeOptions,
    ])

    const sizeOptions = createElement('div', { className: 'preference-options' })
    for (const [value, label] of [['compact', 'Compacta'], ['standard', 'Padrão'], ['large', 'Ampliada']]) {
      const button = createElement('button', { type: 'button', text: label, 'aria-pressed': String(captionPreset === value) })
      button.addEventListener('click', () => {
        captionPreset = value
        body.dataset.captionSize = captionPreset
        renderPanelContent('preferences')
      })
      sizeOptions.append(button)
    }
    const sizeCard = createElement('div', { className: 'preference-card' }, [
      createElement('strong', { text: 'Tamanho da legenda' }),
      createElement('p', { text: 'Compacta, padrão ou ampliada. Nenhuma opção afeta outras pessoas.' }),
      sizeOptions,
    ])

    return createElement('div', { className: 'preference-list' }, [modeCard, sizeCard])
  }

  function renderAudioPanel() {
    const meter = createElement('div', { className: 'level-meter', 'aria-label': 'Nível simulado do microfone: bom' })
    for (let index = 0; index < 7; index += 1) meter.append(createElement('i'))
    const deviceCard = createElement('div', { className: 'audio-device-card' }, [
      createElement('strong', { text: 'Raptor Lake-P/U/H cAVS' }),
      createElement('span', { text: 'Entrada padrão · pronta para testar' }),
      meter,
      createElement('button', { className: 'button button--secondary', type: 'button', text: 'Testar microfone', dataset: { mutationControl: '' } }),
    ])
    const privacy = createElement('div', { className: 'privacy-callout' }, [
      createIcon('check'),
      createElement('span', { text: 'O áudio do teste não é enviado nem gravado. O nível é calculado neste navegador.' }),
    ])
    return createElement('div', { className: 'panel-form' }, [
      createElement('p', { className: 'panel-intro', text: 'A informação técnica fica aqui; a barra mostra somente o estado acionável.' }),
      deviceCard,
      privacy,
    ])
  }

  function renderActionsPanel() {
    const list = createElement('div', { className: 'action-list' })
    const preferences = createElement('button', { type: 'button' }, [
      createIcon('settings'),
      createElement('span', {}, [
        createElement('strong', { text: 'Preferências de legenda' }),
        createElement('small', { text: 'Tamanho e modo de leitura' }),
      ]),
    ])
    preferences.addEventListener('click', () => openPanel('preferences', panelTrigger))
    list.append(preferences)

    const leave = createElement('button', { type: 'button' }, [
      createIcon('exit'),
      createElement('span', {}, [
        createElement('strong', { text: 'Sair da reunião' }),
        createElement('small', { text: 'Somente você sai' }),
      ]),
    ])
    leave.addEventListener('click', () => {
      closePanel({ restoreFocus: false })
      openActionDialog(leaveDialog, document.querySelector('#leave-button'), document.querySelector('#leave-cancel-button'))
    })
    list.append(leave)

    if (options.role === 'host' && options.state !== 'meeting-ended-readonly') {
      const end = createElement('button', { type: 'button', className: 'action-list__danger', dataset: { mutationControl: '' } }, [
        createIcon('stop'),
        createElement('span', {}, [
          createElement('strong', { text: 'Encerrar para todos' }),
          createElement('small', { text: 'Bloqueia novas mensagens e transcrições' }),
        ]),
      ])
      end.addEventListener('click', () => {
        closePanel({ restoreFocus: false })
        openActionDialog(endDialog, document.querySelector('#end-meeting-button'), document.querySelector('#end-cancel-button'))
      })
      list.append(end)
    }
    return list
  }

  function renderPanelContent(panelName) {
    const renderer = {
      chat: renderChatPanel,
      people: renderPeoplePanel,
      context: renderContextPanel,
      preferences: renderPreferencesPanel,
      'audio-help': renderAudioPanel,
      actions: renderActionsPanel,
    }[panelName]
    panelContent.replaceChildren(renderer ? renderer() : createElement('div', { className: 'panel-empty', text: 'Painel indisponível.' }))
  }

  function openPanel(panelName, trigger, { updateUrl = true } = {}) {
    if (!PANEL_COPY[panelName]) return
    if (meetingPanel.open) {
      const previousTrigger = panelTrigger
      meetingPanel.close()
      panelTrigger = previousTrigger
    }
    options.panel = panelName
    panelTrigger = trigger
    const [kicker, title] = PANEL_COPY[panelName]
    panelKicker.textContent = kicker
    panelTitle.textContent = title
    renderPanelContent(panelName)
    meetingPanel.dataset.open = 'true'
    Object.values(panelButtons).forEach((button) => button?.setAttribute('aria-expanded', String(button === trigger)))
    if (matchMedia('(max-width: 1023px)').matches) meetingPanel.showModal()
    else meetingPanel.show()
    queueMicrotask(() => panelTitle.focus({ preventScroll: true }))
    if (updateUrl) updatePrototypeUrl()
  }

  function closePanel({ restoreFocus = true } = {}) {
    if (!meetingPanel.open) return
    meetingPanel.dataset.restoreFocus = String(restoreFocus)
    meetingPanel.dataset.open = 'false'
    meetingPanel.close()
  }

  meetingPanel.addEventListener('close', () => {
    meetingPanel.dataset.open = 'false'
    Object.values(panelButtons).forEach((button) => button?.setAttribute('aria-expanded', 'false'))
    const shouldRestoreFocus = meetingPanel.dataset.restoreFocus !== 'false'
    meetingPanel.dataset.restoreFocus = 'true'
    options.panel = null
    updatePrototypeUrl()
    if (shouldRestoreFocus) panelTrigger?.focus({ preventScroll: true })
    panelTrigger = null
  })

  function openActionDialog(dialog, trigger, initialFocus) {
    dialogTriggers.set(dialog, trigger)
    dialog.showModal()
    queueMicrotask(() => initialFocus.focus({ preventScroll: true }))
  }

  for (const dialog of [inviteDialog, leaveDialog, endDialog]) {
    dialog.addEventListener('close', () => dialogTriggers.get(dialog)?.focus({ preventScroll: true }))
  }

  variantSelect.addEventListener('change', () => setOptions({ variant: variantSelect.value }))
  roleSelect.addEventListener('change', () => setOptions({ role: roleSelect.value, panel: null }))
  stateSelect.addEventListener('change', () => setOptions({ state: stateSelect.value, panel: null }))

  document.querySelector('#caption-smaller').addEventListener('click', () => {
    captionPreset = adjustCaptionPreset(captionPreset, -1)
    body.dataset.captionSize = captionPreset
    captionAnnouncer.textContent = `Legenda ${captionPreset === 'compact' ? 'compacta' : captionPreset === 'standard' ? 'padrão' : 'ampliada'}.`
  })
  document.querySelector('#caption-larger').addEventListener('click', () => {
    captionPreset = adjustCaptionPreset(captionPreset, 1)
    body.dataset.captionSize = captionPreset
    captionAnnouncer.textContent = `Legenda ${captionPreset === 'large' ? 'ampliada' : captionPreset === 'standard' ? 'padrão' : 'compacta'}.`
  })

  modeButtons.forEach((button) => button.addEventListener('click', () => {
    setOptions({ state: button.dataset.captionMode === 'adapted' ? 'live-adapted' : 'live-literal' })
  }))

  transcriptionButton.addEventListener('click', () => {
    setOptions({ state: body.dataset.transcribing === 'true' ? 'live-empty' : 'live-literal' })
  })

  for (const [panelName, button] of Object.entries(panelButtons)) {
    button?.addEventListener('click', () => {
      if (meetingPanel.open && options.panel === panelName) closePanel()
      else openPanel(panelName, button)
    })
  }
  document.querySelector('#panel-close').addEventListener('click', () => closePanel())
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !meetingPanel.open || meetingPanel.matches(':modal')) return
    event.preventDefault()
    closePanel()
  })

  document.querySelector('#invite-button').addEventListener('click', (event) => {
    copyFeedback.textContent = ''
    openActionDialog(inviteDialog, event.currentTarget, document.querySelector('#copy-invite-button'))
  })
  document.querySelector('#invite-done-button').addEventListener('click', () => inviteDialog.close())
  document.querySelector('#copy-invite-button').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(inviteLink.value)
      copyFeedback.textContent = 'Link copiado. Pronto para compartilhar.'
    } catch {
      inviteLink.select()
      copyFeedback.textContent = 'Link selecionado. Use Ctrl+C para copiar.'
    }
  })

  document.querySelector('#leave-button').addEventListener('click', (event) => {
    openActionDialog(leaveDialog, event.currentTarget, document.querySelector('#leave-cancel-button'))
  })
  document.querySelector('#leave-cancel-button').addEventListener('click', () => leaveDialog.close())
  document.querySelector('#leave-confirm-button').addEventListener('click', () => {
    leaveDialog.close()
    meetingShell.hidden = true
    entranceShell.hidden = false
    entranceKicker.textContent = 'Saída concluída'
    entranceTitle.textContent = 'Você saiu da reunião'
    entranceMessage.textContent = 'A conversa continua para as outras pessoas.'
    inviteProgress.hidden = true
    joinForm.hidden = true
    entranceAction.hidden = false
    entranceAction.textContent = 'Voltar ao início'
    entranceTitle.focus({ preventScroll: true })
  })

  document.querySelector('#end-meeting-button').addEventListener('click', (event) => {
    openActionDialog(endDialog, event.currentTarget, document.querySelector('#end-cancel-button'))
  })
  document.querySelector('#end-cancel-button').addEventListener('click', () => endDialog.close())
  document.querySelector('#end-confirm-button').addEventListener('click', () => {
    endDialog.close()
    setOptions({ state: 'meeting-ended-readonly', panel: null })
    document.querySelector('#captions').focus({ preventScroll: true })
  })

  entranceAction.addEventListener('click', () => {
    location.href = location.pathname
  })
  joinForm.addEventListener('submit', (event) => {
    event.preventDefault()
    if (!guestName.value.trim()) {
      guestName.setCustomValidity('Informe seu nome para entrar.')
      guestName.reportValidity()
      guestName.addEventListener('input', () => guestName.setCustomValidity(''), { once: true })
      return
    }
    setOptions({ role: 'participant', state: 'live-literal', panel: null })
  })

  statePrimaryAction.addEventListener('click', () => {
    if (['mic-denied', 'local-audio-without-text'].includes(options.state)) {
      openPanel('audio-help', document.querySelector('#audio-help-button'))
      return
    }
    if (options.state === 'meeting-ended-readonly') {
      location.href = location.pathname
      return
    }
    setOptions({ state: options.role === 'host' ? 'live-empty' : 'live-literal' })
  })

  raiseHandButton.addEventListener('click', () => {
    const raised = raiseHandButton.getAttribute('aria-pressed') !== 'true'
    raiseHandButton.setAttribute('aria-pressed', String(raised))
    raiseHandButton.querySelector('strong').textContent = raised ? 'Baixar mão' : 'Levantar mão'
    raiseHandState.textContent = raised ? 'Mão levantada' : 'Disponível'
    captionAnnouncer.textContent = raised ? 'Sua mão está levantada.' : 'Sua mão foi baixada.'
  })

  document.querySelector('#caption-lines').addEventListener('click', (event) => {
    if (!event.target.closest('.caption-line--older, .caption-line--previous')) return
    returnLiveButton.hidden = false
    body.dataset.historyMode = 'reviewing'
  })
  returnLiveButton.addEventListener('click', () => {
    returnLiveButton.hidden = true
    body.dataset.historyMode = 'live'
    document.querySelector('.caption-line--current').scrollIntoView({ block: 'center', behavior: 'smooth' })
    captionAnnouncer.textContent = 'Você voltou ao trecho ao vivo.'
  })

  if (new URLSearchParams(location.search).get('clean') === '1') consoleElement.hidden = true
  render()
}

if (typeof document !== 'undefined') initPrototype()
