$(initSelect);

function initSelect() {
  $.get('/api/milestones', function(data) {
    $select = $('<select>', { className: 'test' });
    $select.append($('<option>', { disabled: true, selected: true }).text('Select a milestone'));
    data.sort().forEach(function(m) {
      $option = $('<option>', { value: m.match(/^\d\.\d\.\d/), text: m }).text(m);
      $select.append($option);
    });
    $('.form').append($select);
    $select.on('change', onSelectUpdate);
  });
}

function onSelectUpdate(e) {
  var version = $(e.currentTarget).val();
  if(version) renderFiles(version);
}

// TODO needs to be templated...
function renderFiles(version) {
  $.get('/api/data?v=' + version, function(data) {
    $('.output').html(
      $('<h2>').text(data.milestone.title),
      $('<p>').text(data.milestone.description),
      $('<div class="divider">')
    );
    if(data.warnings.unstarted.length || data.warnings.inProgress.length || data.warnings.awaitingReview.length) {
      $('.output').append(
        $('<h3>').text('Warnings'),
        $('<p>').text('The following bugs have not been merged, and will be missed from the release.')
      );
      if(data.warnings.unstarted.length) {
        $('.output').append(
          $('<h4>').text('Unstarted'),
          renderItems(data.warnings.unstarted)
        );
      }
      if(data.warnings.inProgress.length) {
        $('.output').append(
          $('<h4>').text('In-progress'),
          renderItems(data.warnings.inProgress)
        );
      }
      if(data.warnings.awaitingReview.length) {
        $('.output').append(
          $('<h4>').text('Awaiting Review'),
          renderItems(data.warnings.awaitingReview)
        );
      }
      $('.output').append($('<div class="divider">'));
    }
    $('.output').append(
      $('<h3>').text('Release Summary'),
      $('<h4>').text('Fixed'),
      renderItems(data.bugs),
      $('<h4>').text('Added'),
      renderItems(data.features),
      $('<div class="divider">'),
      $('<h3>').text('Files'),
      $('<a>', { class: 'file', href: '/package.json', download: 'package-' + version + '.json' }).text('Download package.json'),
      $('<a>', { class: 'file', href: '/CHANGELOG.md', download: 'CHANGELOG-' + version + '.md' }).text('Download CHANGELOG.md')
    );
  });
}

function renderItems(items) {
  $container = $('<div>');
  items.forEach(function(i) {
    $container.append($('<div class="item">').text('#' + i.number + ': ' + i.title));
  });
  return $container;
}
