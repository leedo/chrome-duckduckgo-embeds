(function(){
  var patterns = $([]);
  var css = "https://noembed.com/noembed.css";
  var oembed = "https://noembed.com/embed?url=";
  var css_inserted = false;
  var embed_timer = null;
  var queue = [];
 
  var update_patterns = function(callback) {
    $.ajax({
      method : "get",
      url : "https://noembed.com/providers",
      dataType : "json",
      success: function(data) {
        if (!data) return;
        $(data).each(function(i, provider) {
          $(provider.patterns).each(function(j, pattern) {
            patterns.push(new RegExp(pattern));
          });
        });
        callback() if callback;
      }
    });
  };

  var insert_css = function() {
    css_inserted = true;
    $("<link/>", {
      rel: "stylesheet",
      type: "text/css",
      href: css,
    }).appendTo("head");
  };

  var find_links = function () {
    $('#links a.url:not(.noembed-processed)').each(function(i, link) {
      link = $(link);
      link.addClass("noembed-processed");
      patterns.each(function(j, pattern) {
        if (pattern.test(link.attr('href'))) {
          queue.push(link);
        }
      });
    });
  };

  var embed = function () {
    var link = queue.shift();
    clearTimeout(embed_timer);

    if (!link) {
      embed_timer = setTimeout(embed, 3000);
      return;
    }

    var href = link.attr('href');
    if (!css_inserted) insert_css();

    $.ajax({
      method : "get",
      url : oembed + encodeURI(href),
      dataType: "json",
      success: function(data) {
        if (!data['html']) return;

        var container = link.parents("div.links_main");
        if (!container) return;

        var html = $(data['html']);
        html.css({marginTop: "0.5em"});
        container.find(".snippet").remove();
        container.append(html);
      },
      complete: function() {
        embed_timer = setTimeout(embed, 500);
      }
    });
  };

  update_patterns(embed);
  setInterval(find_links, 1000);
})();
