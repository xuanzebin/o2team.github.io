'use strict';

var pathFn      = require('path');
var _           = require('lodash');
var cheerio     = require('cheerio');
var util        = require('hexo-util');
var publicDir   = hexo.public_dir;
var sourceDir   = hexo.source_dir;
var route       = hexo.route;

var postImgDir  = 'img/post/';      

// Utils
function startsWith(str, start){
    return str.substring(0, start.length) === start;
}

// Hexo extensions
hexo.extend.helper.register('raw_link', function(path){
    return 'https://github.com/o2team/o2team.github.io/edit/master/source/' + path;
});

hexo.extend.helper.register('page_anchor', function(str){
  var $ = cheerio.load(str, {decodeEntities: false});
  var headings = $('h1, h2, h3, h4, h5, h6');

  if (!headings.length) return str;

  headings.each(function(){
    var id = $(this).attr('id');

    $(this)
      .addClass('post-heading')
      .append('<a class="post-anchor" href="#' + id + '" aria-hidden="true"></a>');
  });

  return $.html();
});

hexo.extend.helper.register('post_img', function(path){
    if(path.indexOf('http://') === 0 || path.indexOf('https://') === 0) return path;
    path = this.url_for((hexo.theme.config.post.img_dir || postImgDir) + path);
    return path;
});

hexo.extend.helper.register('header_menu', function(className){
  var menu = this.site.data.menu;
  var result = '';
  var self = this;
  var lang = this.page.lang;
  var isDefaultLang = lang === 'zh-cn';

  _.each(menu, function(path, title){
    if (!isDefaultLang && ~localizedPath.indexOf(title)) path = lang + '/' + path;

    result += '<li class="' + className + '-item">';
    result += '<a href="' + self.url_for(path) + '" class="' + className + '-link">' + self.__('menu.' + title) + '</a>';
    result += '</li>';
  });

  return result;
});

hexo.extend.helper.register('lang_name', function(lang){
    var data = this.site.data.languages[lang];
    return data.name || data;
});

hexo.extend.helper.register('canonical_path_for_nav', function(){
    var path = this.page.canonical_path;

    if (startsWith(path, 'docs/') || startsWith(path, 'api/')){
        return path;
    }
    return '';
});

// Custom hexo tags
/**
 * post img
 * usage: {% pimg imageName [alt text] [JSONImageAttibutes] %}
 * ref: https://github.com/wsk3201/hexo-local-image
 */
hexo.extend.tag.register('pimg', function(args,content){
    var imageName = args[0],
        altText = "",
        imgAttr = "{}",
        themeConfig = hexo.theme.config;

    switch(args.length){
        case 1:
            break;
        case 2:
            altText = args[1]
            if(altText.length > 1 && altText[0] === '{' && altText[altText.length-1] === '}'){
                imgAttr = altText;
            }
            break;
        case 3:
            altText = args[1];
            imgAttr = args[2];
            break;       
    }
    try {
        imgAttr = JSON.parse(imgAttr);
    }catch(e){
        console.log('scripts.helpers.pimg', e);
        imgAttr = {};
    }
    imgAttr.src   = hexo.config.root + (themeConfig.post.img_dir||postImgDir) + imageName;
    imgAttr.alt = imgAttr.alt || altText;

    // spaces proccess
    for(var p in imgAttr){
        if(typeof imgAttr[p] !== 'string') continue;
        imgAttr[p] = imgAttr[p].replace(/\%20/g, ' ');
    }

    return util.htmlTag('img', imgAttr);
});