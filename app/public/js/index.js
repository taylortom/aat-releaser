/**
* Templates
*/

var heading = function(level, text) {
  return _.template("<h<%=level%>><%=text%></h>")({ level: level, text: text});
};
var paragraph = function(text) {
  return _.template("<p><%=text%></p>")({ text: text });
};
var fileDL = function(filename) {
  return _.template("<a class='file' href='/<%=filename%>' target-'_blank'>Download <%=filename%></a>")({ filename: filename });
};
var nextButton = function() {
  var $btn = $(_.template("<button class='next'>Next</button>")());
  $btn.click(function() { $(document).trigger('next'); });
  return $btn;
};
var list = function(heading, items) {
  return _.template(
    "<div class='items'>" +
      "<h4><%=heading%></h4>" +
      "<ul>" +
        "<%_.forEach(items, function(i) {%>" +
          "<li>#<%=i.number%>: <%=i.title%></li>" +
        "<%})%>" +
      "</ul>" +
    "</div>"
  )({ heading: heading, items: items });
}
var select = function(id, options) {
  return _.template(
    "<select id='<%=id%>'>" +
      "<option disabled selected>Select a milestone</option>" +
      "<%_.forEach(options, function(o) {%>" +
        "<option value='<%=o.version%>'><%=o.name%></option>" +
      "<%})%>" +
    "</select>"
  )({ id: id, options: options });
};

/**
* Steps
*/
var steps = [
  'Intro',
  'Warnings',
  'Summary',
  'Files'
];
var step = 0;

/**
* Functions
*/

$(function() {
  initSelect();
  $(document).on('next', handleNext);
});

function initSelect() {
  $.get('/api/milestones', function(data) {
    $('.form').append(select('milestones', data.sort().map(function(m) { return { version: m.match(/^\d\.\d\.\d/), name: m } })));

    $('select#milestones').on('change', function onSelectUpdate(e) {
      var version = $(e.currentTarget).val();
      if(version) $.get('/api/data?v=' + version, render);
    });
  });
}

function handleNext(e) {
  console.log('Next!!', steps[step++]);
}

function render(data) {
  $('.output').html('');
  renderReleaseHeader(data.milestone);

  if(data.warnings) {
    renderWarnings(data.warnings);
  }
  if(!data.bugs.length && !data.features.length) {
    return appendOutput(
      heading(3, 'Nothing to see here...'),
      paragraph('No work has been completed for this release.')
    );
  }
  renderSummary(data.bugs, data.features);
  renderFiles();
}
// HACK do the params better...
function appendOutput($el, $el2, $el3) {
  $('.output').append($el, $el2, $el3);
}

function renderItems(heading, items) {
  return $('<div>').append(heading(4, heading), list(items));
}

function renderReleaseHeader(milestone) {
  appendOutput(heading(2, milestone.title), paragraph(milestone.description));
}

function renderWarnings(warnings) {
  var _renderWarnings = function(heading, warnings) {
    appendOutput(list(heading, warnings));
  };
  var unstarted = warnings.unstarted.length ? warnings.unstarted : undefined;
  var inProgress = warnings.inProgress.length ? warnings.inProgress : undefined;
  var awaitingReview = warnings.awaitingReview.length ? warnings.awaitingReview : undefined;

  if(!unstarted && !inProgress && !awaitingReview) {
    return;
  }
  appendOutput(
    heading(3, 'Warnings'),
    paragraph('The following bugs have not been merged, and will be missed from the release:')
  );
  if(unstarted) _renderWarnings('Unstarted', unstarted);
  if(inProgress) _renderWarnings('In-progress', inProgress);
  if(awaitingReview) _renderWarnings('Awaiting Review', awaitingReview);
}

function renderSummary(bugs, features) {
  appendOutput(
    heading(3, 'Release Summary'),
    list('Fixed', bugs),
    list('Added', features),
  );
}

function renderFiles() {
  appendOutput(
    heading(3, 'Files'),
    fileDL('package.json'),
    fileDL('CHANGELOG.md')
  );
}
