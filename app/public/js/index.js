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
  return _.template("<a class='file' href='/<%=filename%>' target='_blank'><%=filename%></a>")({ filename: filename });
};
var list = function(heading, items) {
  return _.template(
    "<div class='items'>" +
      "<h4><%=heading%></h4>" +
      "<ul>" +
        "<%_.forEach(items, function(i) {%>" +
          "<li><a <%if(i.ignore){%>class='ignore'<%}%> href='<%=i.html_url%>' target='_blank'>#<%=i.number%>: <%=i.title%></a></li>" +
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
* Functions
*/

$(function() {
  initSelect();
});

function initSelect() {
  var $tempSelect = $(select('milestones', [])).attr('disabled', true);
  $('.form').append($tempSelect);

  $.get('/api/milestones', function(data) {
    $('.form').append(select('milestones', data.sort().map(function(m) { return { version: m.match(/^\d\.\d\.\d/), name: m } })));
    $tempSelect.remove();

    $('select#milestones').on('change', function onSelectUpdate(e) {
      var version = $(e.currentTarget).val();
      if(version) $.get('/api/data?v=' + version, render);
    });
  });
}

function render(data) {
  $('.output').html('');
  renderReleaseHeader(data.milestone);

  if(data.warnings) {
    renderWarnings(data.warnings);
  }
  renderSummary(data.bugs, data.features);
  renderFiles();
}

function appendSection(id, children) {
  if(arguments.length === 1) {
    children = id;
    id = undefined;
  }
  $parent = $('<div>', { id: id, class: 'section' });
  children.forEach(function($el) { $parent.append($el); });
  $('.output').append($parent);
}

function renderItems(heading, items) {
  return $('<div>').append(heading(4, heading), list(items));
}

function renderReleaseHeader(milestone) {
  appendSection('header', [heading(2, milestone.title), paragraph(milestone.description)]);
}

function renderWarnings(warnings) {
  var unstarted = warnings.unstarted.length ? warnings.unstarted : undefined;
  var inProgress = warnings.inProgress.length ? warnings.inProgress : undefined;
  var awaitingReview = warnings.awaitingReview.length ? warnings.awaitingReview : undefined;

  if(!unstarted && !inProgress && !awaitingReview) {
    return appendSection('nowarnings', [
      heading(3, 'Ready for release'),
      paragraph('All open issues have been completed.')
    ]);
  }
  var divs = [
    heading(3, 'Warnings'),
    paragraph('The following bugs have not been merged, and will be missed from the release:')
  ];
  if(unstarted) divs.push(list('Unstarted', unstarted));
  if(inProgress) divs.push(list('In-progress', inProgress));
  if(awaitingReview) divs.push(list('Awaiting Review', awaitingReview));

  appendSection('warnings', divs);
}

function renderSummary(bugs, features) {
  if(!bugs.length && !features.length) {
    return appendSection('summary', [
      heading(3, 'Nothing to see here...'),
      paragraph('No work has been completed for this release.')
    ]);
  }
  appendSection('summary', [
    heading(3, 'Release Summary'),
    paragraph('The following bugs and enhancements are included in this release'),
    paragraph('Note: those issues with a strikethrough will be omitted from the final CHANGELOG.md'),
    list('Fixed', bugs),
    list('Added', features)
  ]);
}

function renderFiles() {
  appendSection('files', [
    heading(3, 'Files'),
    paragraph('The documentation for release has been generated. Click the below to view the amended files:'),
    fileDL('package.json'),
    fileDL('CHANGELOG.md')
  ]);
}
