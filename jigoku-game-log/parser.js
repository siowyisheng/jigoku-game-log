// gets all game messages in a HTMLCollection
var messages = document.getElementsByClassName('message')

var log = ''
// the actual log to be appended to (the output)
var cardsPlayed = {}
// to be populated with two keys of the player names, with values as a list of strings of cards played
var cardsUsed = {}
// same as cardsPlayed but for cards used (ie. procced)
var cardsDrawnInDrawPhase = {}
// to be populated with two keys of the player names, with integer values for the # of cards drawn in the last draw phase
var justInitiatedConflict = false
// used to silence confusing text from proccing Endless Plains
var p1 = ''
var p2 = ''
var confAttacker, confType, confRing, confProvince, confSkill, confDefenderSkill
var favorCount
var conceded = false
var shorten = s => s.substring(0, 2).toUpperCase()
var capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)

// loop through once to identify player names and p1 and p2
var playersAreIntroduced = false
for (var message of messages) {
  var s = message.textContent
  var dynastyFlop = /^(.*) reveals (.*)/
  if (!!dynastyFlop.test(s)) {
    var m = dynastyFlop.exec(s)
    if (p1 !== '' && p2 === '') {
      p2 = m[1]
    }
    if (p1 === '') {
      p1 = m[1]
    }
  }
  if (!playersAreIntroduced && !!p1 && !!p2) {
    log += `${p1} (${shorten(p1)}) vs ${p2} (${shorten(p2)})\n\n`
    playersAreIntroduced = true
  }
}

// adds cards played and cards used per player to the log and empties the objects
var dumpCardMessages = () => {
  if (!!cardsPlayed[p1]) {
    log += `${shorten(p1)} played ${cardsPlayed[p1].join(', ')}\n`
  }
  if (!!cardsPlayed[p2]) {
    log += `${shorten(p2)} played ${cardsPlayed[p2].join(', ')}\n`
  }
  cardsPlayed = {}
  if (!!cardsUsed[p1]) {
    log += `${shorten(p1)} used ${cardsUsed[p1].join(', ')}\n`
  }
  if (!!cardsUsed[p2]) {
    log += `${shorten(p2)} used ${cardsUsed[p2].join(', ')}\n`
  }
  cardsUsed = {}
}

// this is the main loop parsing each message
// we define all the different regex to be matched
// if matched, then we do something (either set a variable for later or add something to the log)
for (var message of messages) {
  var s = message.textContent
  var dynastyFlop = /^(.*) reveals (.*)/
  var bid = /a bid of (\d)/
  if (!!dynastyFlop.test(s) && !bid.test(s)) {
    var m = dynastyFlop.exec(s)
    if (p1 !== '' && p2 === '') {
      p2 = m[1]
    }
    if (p1 === '') {
      p1 = m[1]
    }
    log += `${shorten(m[1])} revealed ${m[2]}\n`
  }

  var dynastyPhase = /^turn: (\d+) - dynasty phase$/
  if (!!dynastyPhase.test(s)) {
    var m = dynastyPhase.exec(s)
    if (m[1] > 1) {
      dumpCardMessages()
      log += `\n`
    }
    log += `Dynasty/Draw Phase (T${m[1]})\n\n`
  }

  var dynastyDuplicate = /^(.*) discards a duplicate to add 1  to (.*)/
  if (!!dynastyDuplicate.test(s)) {
    var m = dynastyDuplicate.exec(s)
    if (!cardsPlayed[m[1]]) {
      cardsPlayed[m[1]] = []
    }
    cardsPlayed[m[1]].push(`duped ${m[2]}`)
  }

  var passingFate = /^(.*) is the first to pass/
  if (!!passingFate.test(s)) {
    var passingFatePlayer = shorten(passingFate.exec(s)[1])
  }

  var drawPhaseDraw = /^(.*) draws (\d+)(.*) for the draw phase$/
  if (!!drawPhaseDraw.test(s)) {
    var m = drawPhaseDraw.exec(s)
    cardsDrawnInDrawPhase[m[1]] = m[2]
  }

  var conflictPhase = /^turn: (\d+) - conflict phase$/
  if (!!conflictPhase.test(s)) {
    var m = conflictPhase.exec(s)
    dumpCardMessages()
    log += `${passingFatePlayer} got the passing fate\n`
    log += `${shorten(p1)} drew ${cardsDrawnInDrawPhase[p1]}, ${shorten(
      p2
    )} drew ${cardsDrawnInDrawPhase[p2]}\n`
    log += `\nConflict Phase (T${m[1]})\n`
  }

  var playCharacter = /^(.*) plays (.*?) (into the conflict|at home)?\s?with (\d+) additional/
  if (!!playCharacter.test(s)) {
    var m = playCharacter.exec(s)
    if (!cardsPlayed[m[1]]) {
      cardsPlayed[m[1]] = []
    }
    cardsPlayed[m[1]].push(`${m[2]}+${m[4]}${!!m[3] ? ` ${m[3]}` : ``}`)
  }

  var playNonCharacter = /^(.*) plays (.*?)(, .*?)? to/
  if (!!playNonCharacter.test(s)) {
    var m = playNonCharacter.exec(s)
    if (!cardsPlayed[m[1]]) {
      cardsPlayed[m[1]] = []
    }
    cardsPlayed[m[1]].push(m[2])
  }

  var useCard = /^(.*) uses (.*?)(, .*?)? to/
  if (!!useCard.test(s)) {
    var m = useCard.exec(s)
    if (!cardsUsed[m[1]]) {
      cardsUsed[m[1]] = []
    }
    cardsUsed[m[1]].push(m[2])
  }

  var initiateConflict = /^(.*) is initiating a (.*) conflict at (.*), contesting the (.*) ring/
  if (!!initiateConflict.test(s)) {
    justInitiatedConflict = true
    log += '\n'
    var m = initiateConflict.exec(s)
    dumpCardMessages()
    confAttacker = m[1]
    confType = m[2]
    confProvince = m[3]
    confRing = m[4]
  }

  var conflictSkill = /^(.*) has initiated a (?:military|political) conflict with skill (\d+)/
  if (!!conflictSkill.test(s)) {
    var m = conflictSkill.exec(s)
    confSkill = m[2]
  }

  var conflictDefenderSkill = /^(.*) has defended with skill (\d+)/
  if (!!conflictDefenderSkill.test(s)) {
    var m = conflictDefenderSkill.exec(s)
    justInitiatedConflict = false
    confDefenderSkill = m[2]
    log += `\n${shorten(confAttacker)} initiated ${capitalize(
      confType
    )} ${capitalize(
      confRing
    )} confict at ${confProvince} (${confSkill} vs ${confDefenderSkill})\n`
  }

  var conflictNoDefense = /^(.*) does not defend the conflict/
  if (!!conflictNoDefense.test(s)) {
    var m = conflictNoDefense.exec(s)
    justInitiatedConflict = false
    log += `${shorten(confAttacker)} initiated ${capitalize(
      confType
    )} ${capitalize(
      confRing
    )} confict at ${confProvince} (${confSkill} vs undefended)\n`
  }

  var wonConflict = /^(.*) won a (?:military|political) conflict (\d+) vs (\d+)/
  if (!!wonConflict.test(s)) {
    var m = wonConflict.exec(s)
    dumpCardMessages()
    log += `${shorten(m[1])} won the conflict ${m[2]} vs ${m[3]}\n`
  }

  var drawConflict = /There is no winner or loser for this conflict because both sides have 0 skill/
  if (!!drawConflict.test(s)) {
    dumpCardMessages()
    log += `The conflict was a draw (both sides have 0 skill)\n`
  }

  var brokeProvince = /^(.*) has broken (.*)!/
  if (!!brokeProvince.test(s)) {
    var m = brokeProvince.exec(s)
    if (justInitiatedConflict && m[2] === 'Endless Plains') {
    } else {
      log += `${shorten(m[1])} broke ${m[2]}\n`
    }
  }

  var discard = /^(.*) chooses to discard (.*)/
  if (!!discard.test(s)) {
    var m = discard.exec(s)
    log += `${shorten(m[1])} discarded ${m[2]}\n`
  }

  var takeFateFromRing = /^(.*) takes (\d+) fate from the (.*) ring/
  if (!!takeFateFromRing.test(s)) {
    var m = takeFateFromRing.exec(s)
    log += `${shorten(m[1])} took ${m[2]} fate from the ${m[3]} ring\n`
  }

  var passConflictOpp = /^(.*) passes their conflict opportunity/
  if (!!passConflictOpp.test(s)) {
    var m = passConflictOpp.exec(s)
    log += `\n${shorten(m[1])} passed their conflict\n`
  }

  var claimFavorCount = /^(.*) wins the glory count (\d+ vs \d+)/
  if (!!claimFavorCount.test(s)) {
    var m = claimFavorCount.exec(s)
    favorCount = m[2]
  }

  var claimFavorType = /^(.*) claims the Emperor's (.*) favor/
  if (!!claimFavorType.test(s)) {
    var m = claimFavorType.exec(s)
    dumpCardMessages()
    log += `${shorten(m[1])} claimed ${m[2]} favor: ${favorCount}\n`
  }

  var favorTie = /Both players are tied in glory/
  if (!!favorTie.test(s)) {
    var m = claimFavorType.exec(s)
    dumpCardMessages()
    log += `Glory is tied`
  }

  var resolveRing = /^(.*) resolves the (.*) ring/
  if (!!resolveRing.test(s)) {
    var m = resolveRing.exec(s)
    dumpCardMessages()
    log += `${shorten(m[1])} resolves the ${m[2]} ring\n`
  }

  var fatePhase = /^turn: (\d+) -  phase/
  if (!!fatePhase.test(s)) {
    var m = fatePhase.exec(s)
    log += `\nFate/Regroup Phase (T${m[1]})\n`
  }

  var concede = /(.*) concedes/
  if (!!concede.test(s)) {
    var conceded = true
  }

  var wonGame = /(.*) has won the game/
  if (!!wonGame.test(s)) {
    dumpCardMessages()
    log += `\n${m[1]} has won the game${
      conceded ? ` (their opponent conceded)` : ``
    }\n\n`
  }
}
log += `~ Log created by Jigoku Game Log chrome extension`

console.log(log)

// from https://www.30secondsofcode.org/snippet/copyToClipboard
var copyToClipboard = str => {
  var el = document.createElement('textarea')
  el.value = str
  el.setAttribute('readonly', '')
  el.style.position = 'absolute'
  el.style.left = '-9999px'
  document.body.appendChild(el)
  var selected =
    document.getSelection().rangeCount > 0
      ? document.getSelection().getRangeAt(0)
      : false
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
  if (selected) {
    document.getSelection().removeAllRanges()
    document.getSelection().addRange(selected)
  }
}

copyToClipboard(log)
