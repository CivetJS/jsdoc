// It's a hack should find better way.
var defined = require('jsdocs/frame').defined;
var plugins = require("jsdocs/plugin-manager");
/** Handle the creation of HTML links to documented symbols.
    @constructor
*/
var Link = exports.Link = function () {
    if (!(this instanceof Link)) return new Link();
    this.alias = "";
    this.src = "";
    this.file = "";
    this.text = "";
    this.innerName = "";
    this.classLink = false;
    this.targetName = "";

    this.target = function(targetName) {
        if (targetName !== undefined) this.targetName = targetName;
        return this;
    }
    this.inner = function(inner) {
        if (inner  !== undefined) this.innerName = inner;
        return this;
    }
    this.withText = function(text) {
        if (text  !== undefined) this.text = text;
        return this;
    }
    this.toSrc = function(filename) {
        if (filename !== undefined) {
                    this.src = filename;
                    this.text = filename;
                }
        return this;
    }
    this.toSymbol = function(alias) {
        if (alias  !== undefined) this.alias = alias.toString();
        return this;
    }
    this.toClass = function(alias) {
        this.classLink = true;
        return this.toSymbol(alias);
    }
    this.toFile = function(file) {
        if (file !== undefined) this.file = file;
        return this;
    }

    this.toString = function() {
        var linkString;
        var thisLink = this;

        if (this.alias) {
            linkString = this.alias.replace(/(^|[^a-z$0-9_#.:^-])([|a-z$0-9_#.:^-]+)($|[^a-z$0-9_#.:^-])/i,
                function(match, prematch, symbolName, postmatch) {
                    var symbolNames = symbolName.split("|");
                    var links = [];
                    for (var i = 0, l = symbolNames.length; i < l; i++) {
                        thisLink.alias = symbolNames[i];
                        links.push(thisLink._makeSymbolLink(symbolNames[i]));
                    }
                    return prematch + links.join("|") + postmatch;
                }
            );
        }
        else if (this.src) {
            linkString = thisLink._makeSrcLink(this.src);
        }
        else if (this.file) {
            linkString = thisLink._makeFileLink(this.file);
        }

        return linkString;
    }
}

/** prefixed for hashes */
Link.hashPrefix = "";

/** Appended to the front of relative link paths. */
Link.base = "";

Link.symbolNameToLinkName = function(symbol) {
    var linker = "";
    if (symbol.isStatic) linker = ".";
    else if (symbol.isInner) linker = "-";

    return Link.hashPrefix+linker+symbol.name;
}

/** Create a link to a snother symbol. */
Link.prototype._makeSymbolLink = function(alias) {
    // TODO: fix this hack
    var linkBase = Link.base + Link.symbolsDir.toString();
    var linkTo = Link.symbolSet.getSymbol(alias);
    var linkPath;
    var target = (this.targetName)? " target=\""+this.targetName+"\"" : "";

    // is it an internal link?
    if (alias.charAt(0) == "#") var linkPath = alias;

    // if there is no symbol by that name just return the name unaltered
    else if (!linkTo) return this.text || alias;

    // it's a symbol in another file
    else {

        if (!linkTo.is("CONSTRUCTOR") && !linkTo.isNamespace) { // it's a method or property
            linkPath = escape(linkTo.memberOf) || "_global_";
            linkPath += Link.ext + "#" + Link.symbolNameToLinkName(linkTo);
        }
        else {
            linkPath = escape(linkTo.alias);
            linkPath += Link.ext + (this.classLink? "":"#" + Link.hashPrefix + "constructor");
        }
        linkPath = linkBase + linkPath
    }

    var linkText = this.text || alias;

    var link = {linkPath: linkPath, linkText: linkText};


    plugins.notify("onSymbolLink", link);

    return "<a href=\""+link.linkPath+"\""+target+">"+link.linkText+"</a>";
}

/** Create a link to a source file. */
Link.prototype._makeSrcLink = function(srcFilePath) {
    var target = (this.targetName) ? ' target="' + this.targetName + '"' : '';
    // transform filepath into a filename
    var srcFile = srcFilePath.replace(/\.\.?[\\\/]/g, "").replace(/[:\\\/]/g, "_");
    var outFilePath = Link.srcDir.join(srcFile + Link.ext);
    //if (!this.text) this.text = FilePath.fileName(srcFilePath);
    return '<a href="--' + outFilePath + '"' + target + '>' + this.text + '</a>';
}

/** Create a link to a source file. */
Link.prototype._makeFileLink = function(filePath) {
    var target = (this.targetName)? " target=\""+this.targetName+"\"" : "";

    var outFilePath =  Link.base + filePath;

    if (!this.text) this.text = filePath;
    return "<a href=\""+outFilePath+"\""+target+">"+this.text+"</a>";
}

exports.link = function link() {
    
}