var updateIframeUrl;

updateIframeUrl = function() {
  var $map_container, iframe_markup, lat, lng, url, zoom;
  url = (show_share_url(this.share.access_token, {
    protocol: protocol
  })) + "?";
  if ($('#share-embeddable-popup-properties').val()) {
    url += '&popup_properties=' + $('#share-embeddable-popup-properties').val();
  }
  if ($('input[name=extent]:checked').val() === 'extent-map') {
    $map_container = $($('#share-demo-iframe').contents()).find('#map-container');
    lat = $map_container.data('lat');
    lng = $map_container.data('lng');
    zoom = $map_container.data('zoom');
    url += "&lat=" + lat + "&lng=" + lng + "&zoom=" + zoom;
  }
  if ($('input[name=title_toggle]:checked').val() === 'on' && $('#share-embeddable-title').val()) {
    url += '&title=' + encodeURIComponent($('#share-embeddable-title').val());
  }
  if ($('#marker-clustering').is(':checked')) {
    url += '&clustering=1';
  }
  if ($('#show-legend').is(':checked')) {
    url += '&legend=1';
  }
  if ($('#marker-size').val() !== 'medium') {
    url += '&marker_size=' + $('#marker-size').val();
  }
  $('#share-demo-iframe').attr('src', url);
  iframe_markup = "<iframe src=\"" + url + "\" width=\"100%\" height=\"400\" scrolling=\"no\" frameborder=\"0\" id=\"share-demo-iframe\"></iframe>";
  return $('#share-embeddable-textarea').val(iframe_markup);
};