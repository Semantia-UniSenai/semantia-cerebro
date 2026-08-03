import assert from 'node:assert/strict'
import test from 'node:test'

import {
  SCENARIOS,
  adjustCaptionPreset,
  buildPrototypeUrl,
  parsePrototypeOptions,
} from './prototype.js'

const EXPECTED_SCENARIOS = [
  'invite-validating',
  'invite-unavailable',
  'meeting-connecting',
  'meeting-reconnecting',
  'live-empty',
  'mic-requesting',
  'mic-denied',
  'local-model-preparing',
  'local-audio-without-text',
  'live-literal',
  'live-adapted',
  'ai-unavailable-literal-fallback',
  'meeting-ended-readonly',
  'action-error',
]

test('expõe exatamente os 14 cenários contratados', () => {
  assert.deepEqual(Object.keys(SCENARIOS), EXPECTED_SCENARIOS)
})

test('usa opções seguras quando a URL contém valores desconhecidos', () => {
  const options = parsePrototypeOptions(
    new URLSearchParams('variant=copiado&role=admin&state=<script>&panel=segredo'),
  )

  assert.deepEqual(options, {
    variant: 'stage',
    role: 'host',
    state: 'live-empty',
    panel: null,
  })
})

test('impede cenário exclusivo de anfitrião no papel participante', () => {
  const options = parsePrototypeOptions(
    new URLSearchParams('variant=focus&role=participant&state=mic-denied'),
  )

  assert.equal(options.role, 'participant')
  assert.equal(options.state, 'live-empty')
})

test('preserva literal e mutações seguras quando o modo adaptado falha', () => {
  const scenario = SCENARIOS['ai-unavailable-literal-fallback']

  assert.equal(scenario.captionAvailable, true)
  assert.equal(scenario.mutationsAllowed, true)
  assert.match(scenario.message, /continua vendo a transcrição literal/i)
})

test('remove mutações quando a reunião está encerrada', () => {
  const scenario = SCENARIOS['meeting-ended-readonly']

  assert.equal(scenario.captionAvailable, true)
  assert.equal(scenario.mutationsAllowed, false)
})

test('limita a preferência de tamanho aos três presets', () => {
  assert.equal(adjustCaptionPreset('compact', -1), 'compact')
  assert.equal(adjustCaptionPreset('compact', 1), 'standard')
  assert.equal(adjustCaptionPreset('standard', 1), 'large')
  assert.equal(adjustCaptionPreset('large', 1), 'large')
})

test('serializa somente opções canônicas no link profundo', () => {
  const url = buildPrototypeUrl('http://127.0.0.1:4174/', {
    variant: 'focus',
    role: 'participant',
    state: 'live-adapted',
    panel: 'preferences',
  })

  assert.equal(
    url,
    'http://127.0.0.1:4174/?variant=focus&role=participant&state=live-adapted&panel=preferences',
  )
})
