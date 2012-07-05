jQuery(document).ready(function ($) {

  /* Use this js doc for all application specific JS */

  /* TABS --------------------------------- */
  /* Remove if you don't need :) */

  function activateTab($tab) {
    var $activeTab = $tab.closest('dl').find('dd.active'),
        contentLocation = $tab.children('a').attr("href") + 'Tab';

    // Strip off the current url that IE adds
    contentLocation = contentLocation.replace(/^.+#/, '#');

    // Strip off the current url that IE adds
    contentLocation = contentLocation.replace(/^.+#/, '#');

    //Make Tab Active
    $activeTab.removeClass('active');
    $tab.addClass('active');

    var id = $tab.children("a").attr("href");

    //Show Tab Content
    $(contentLocation).closest('.tabs-content').children('li').hide();
    $(contentLocation).css('display', 'block');
  }

  $('dl.tabs dd a').on('click.fndtn', function (event) {
    activateTab($(this).parent('dd'));
  });

  if (window.location.hash) {
    activateTab($('a[href="' + window.location.hash + '"]').parent());
    $.foundation.customForms.appendCustomMarkup();
  }

  /* PLACEHOLDER FOR FORMS ------------- */
  /* Remove this and jquery.placeholder.min.js if you don't need :) */
  $('input, textarea').placeholder();

});