// maybe one button for copying to formatted markdown
// one button for copying plaintext

var copyToClipboard = str => {
  var el = document.createElement("textarea");
  el.value = str;
  el.setAttribute("readonly", "");
  el.style.position = "absolute";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  var selected =
    document.getSelection().rangeCount > 0
      ? document.getSelection().getRangeAt(0)
      : false;
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  if (selected) {
    document.getSelection().removeAllRanges();
    document.getSelection().addRange(selected);
  }
};

// get all game messages in a HTMLCollection, concat them, then split them
var messages = document.getElementsByClassName("message");
console.log(messages);
var log = "";
for (i = 0; i < messages.length; i++) {
  log += messages[i].textContent + "\n";
}
var lines = log.split("\n");

// initialize variables that will be used
var finalLog = "";
var line = "";
var currentLine = 0;
var markerLine = 0;

// convenience functions for use 
var addToLog = s => {
  finalLog += s + "\n";
};
var addLineBreak = () => {
  finalLog += "\n";
};
var findNext = s => {
  for (i = currentLine + 1; i < lines.length; i++) {
    if (lines[i].includes(s)) {
      return [i, lines[i]];
    }
  }
};
var isP1 = n => {
  return lines[n].split(" ")[0] === p1Fullname;
};
var shortFromLine = n => {
  return lines[n]
    .split(" ")[0]
    .substring(0, 2)
    .toUpperCase();
};
var listPlayedAndUsed = () => {
  var p1Played = [];
  var p2Played = [];
  var p1Used = [];
  var p2Used = [];
  var re = /\splays\s(.*)\swith\s(\d+)/;
  var rePlayedNotChar = /\splays\s(?:[A-Z][a-z]+\s?)+/;
  var reUses = /\suses\s(?:[A-Z][a-z]+\s?)+/;
  for (i = currentLine + 1; i < markerLine; i++) {
    var matches = re.exec(lines[i]);
    var matchesUses = reUses.exec(lines[i]);
    var matchesPlayedNotChar = rePlayedNotChar.exec(lines[i]);
    if (!!matches) {
      var hire = `${matches[1]}+${matches[2]}`;
      if (isP1(i)) {
        p1Played.push(hire);
      } else {
        p2Played.push(hire);
      }
    } else if (!!matchesUses) {
      if (isP1(i)) {
        p1Used.push(matchesUses[0].substring(6));
      } else {
        p2Used.push(matchesUses[0].substring(6));
      }
    } else if (!!matchesPlayedNotChar) {
      if (isP1(i)) {
        p1Played.push(matchesPlayedNotChar[0].substring(7));
      } else {
        p2Played.push(matchesPlayedNotChar[0].substring(7));
      }
    }
  }

  if (p1Played.length > 0) {
    if (p1Used.length > 0) {
      addToLog(`${p1Shortname} played ${p1Played}, used ${p1Used}`);
    } else {
      addToLog(`${p1Shortname} played ${p1Played}`);
    }
  } else if (p1Used.length > 0) {
    addToLog(`${p1Shortname} used ${p1Used}`);
  }
  if (p2Played.length > 0) {
    if (p2Used.length > 0) {
      addToLog(`${p2Shortname} played ${p2Played}, used ${p2Used}`);
    } else {
      addToLog(`${p2Shortname} played ${p2Played}`);
    }
  } else if (p2Used.length > 0) {
    addToLog(`${p2Shortname} used ${p2Used}`);
  }
};

// start logging stuff
var dynastyLine = findNext("turn: 1 - dynasty phase")[0];
var p1Fullname = lines[dynastyLine + 1].split(" ")[0];
var p2Fullname = lines[dynastyLine + 2].split(" ")[0];
var p1Shortname = p1Fullname.substring(0, 2).toUpperCase();
var p2Shortname = p2Fullname.substring(0, 2).toUpperCase();

addToLog(`${p1Fullname} (${p1Shortname}) vs ${p2Fullname} (${p2Shortname})`);
addLineBreak();

addToLog(`Turn 1 Dynasty / Draw`);
[currentLine, line] = findNext(`${p1Fullname} reveals`);
addToLog(line.replace(`${p1Fullname} reveals`, p1Shortname));
[currentLine, line] = findNext(`${p2Fullname} reveals`);
addToLog(line.replace(`${p2Fullname} reveals`, p2Shortname));
[markerLine, line] = findNext(`is the first to pass`);
listPlayedAndUsed();
addToLog(`${shortFromLine(markerLine)} got the passing fate`);

re = /reveals a bid of (\d)/;
[currentLine, line] = findNext("reveals a bid of");
var firstBid = re.exec(line)[1];
var firstShortname = shortFromLine(currentLine);
re = /reveals a bid of (\d)/;
[currentLine, line] = findNext("reveals a bid of");
var secondBid = re.exec(line)[1];
var secondShortname = shortFromLine(currentLine);
addToLog(
  `Bids - ${firstShortname} ${firstBid} : ${secondShortname} ${secondBid}`
);

[markerLine, line] = findNext(`turn: 1 - conflict phase`);
listPlayedAndUsed();

addLineBreak();
addToLog(`Turn 1 Conflicts`);

[markerLine, line] = findNext(`is initiating a`);
listPlayedAndUsed();
var confPlayer, confType, confProvince, confRing, confForce;
re = /(.*) is initiating a (.*) conflict at (.*), contesting the (.*) ring/;
var matches = re.exec(line);
if (!!matches) {
  [_, confPlayer, confType, confProvince, confRing] = matches;
}
currentLine = markerLine;

var capitalize = s => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

[markerLine, line] = findNext(` has initiated a `);
listPlayedAndUsed();
confForce = /with skill (\d+)/.exec(line)[1]
var defLine = lines[markerLine + 1]
re = /has defended with skill (\d+)/
var confDefForce = defLine.includes(`does not defend the conflict`) ? 'undefended' : re.exec(defLine)[1]
addToLog(
  `${confPlayer.substring(0, 2).toUpperCase()} ${capitalize(
    confType
  )} ${capitalize(confRing)} conflict at ${confProvince} (Force: ${confForce} vs ${confDefForce})`
);


addLineBreak();
addToLog(`~ Log created by Jigoku Game Log chrome extensigion`);

console.log(finalLog);
copyToClipboard(finalLog);

// Turn 1 Conflicts
// PT procced Ethereal Dreamer
// US played Shinjo Ambusher+0

// US Military Earth conflict at Public Forum (2 force)
// PT procced Seeker of Earth
// PT did not defend
// US won but didn't break (2-0)
// US procced Hisu Mori Toride
// PT played Display of Power
// US discarded Charge!
