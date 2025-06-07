!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.htmlDocx=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

var TernarySearchTree = require('./ternary-search-tree');

var XNode = require('./xmltree').XNode;
var XText = require('./xmltree').XText;
var XProcessingInstruction = require('./xmltree').XProcessingInstruction;
var XComment = require('./xmltree').XComment;
var XAttribute = require('./xmltree').XAttribute;
var XElement = require('./xmltree').XElement;
var XDocument = require('./xmltree').XDocument;

var htmlparser = (function() {
  // Regular Expressions for parsing tags and attributes
  var startTag = /^<([\-A-Za-z0-9_]+)((?:\s+[\w\-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
    endTag = /^<\/([\-A-Za-z0-9_]+)[^>]*>/,
    attr = /([\-A-Za-z0-9_]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;

  // Empty Elements - HTML 4.01
  var empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed");

  // Block Elements - HTML 4.01
  var block = makeMap("address,applet,blockquote,button,center,dd,del,dir,div,dl,dt,fieldset,form,frameset,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,p,pre,script,table,tbody,td,tfoot,th,thead,tr,ul");

  // Inline Elements - HTML 4.01
  var inline = makeMap("a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");

  // Elements that you can, intentionally, leave open
  // (and which close themselves)
  var closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");

  // Attributes that have their values filled in disabled="disabled"
  var fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");

  // Special Elements (can contain anything)
  var special = makeMap("script,style");

  var HTMLParser = this.HTMLParser = function( html, handler ) {
    var index, chars, match, stack = [], last = html;
    stack.last = function(){
      return this[ this.length - 1 ];
    };

    while ( html ) {
      chars = true;

      // Make sure we're not in a script or style element
      if ( !stack.last() || !special[ stack.last() ] ) {

        // Comment
        if ( html.indexOf("<!--") == 0 ) {
          index = html.indexOf("-->");

          if ( index >= 0 ) {
            if ( handler.comment )
              handler.comment( html.substring( 4, index ) );
            html = html.substring( index + 3 );
            chars = false;
          }

        // end tag
        } else if ( html.indexOf("</") == 0 ) {
          match = html.match( endTag );

          if ( match ) {
            html = html.substring( match[0].length );
            match[0].replace( endTag, parseEndTag );
            chars = false;
          }

        // start tag
        } else if ( html.indexOf("<") == 0 ) {
          match = html.match( startTag );

          if ( match ) {
            html = html.substring( match[0].length );
            match[0].replace( startTag, parseStartTag );
            chars = false;
          }
        }

        if ( chars ) {
          index = html.indexOf("<");

          var text = index < 0 ? html : html.substring( 0, index );
          html = index < 0 ? "" : html.substring( index );

          if ( handler.chars )
            handler.chars( text );
        }

      } else {
        html = html.replace(new RegExp("(.*)<\/" + stack.last() + "[^>]*>"), function(all, text){
          text = text.replace(/<!--(.*?)-->/g, "$1")
            .replace(/<!\[CDATA\[(.*?)]]>/g, "$1");

          if ( handler.chars )
            handler.chars( text );

          return "";
        });

        parseEndTag( "", stack.last() );
      }

      if ( html == last )
        throw "Parse Error: " + html;
      last = html;
    }

    // Clean up any remaining tags
    parseEndTag();

    function parseStartTag( tag, tagName, rest, unary ) {
      tagName = tagName.toLowerCase();

      if ( block[ tagName ] ) {
        while ( stack.last() && inline[ stack.last() ] ) {
          parseEndTag( "", stack.last() );
        }
      }

      if ( closeSelf[ tagName ] && stack.last() == tagName ) {
        parseEndTag( "", tagName );
      }

      unary = empty[ tagName ] || !!unary;

      if ( !unary )
        stack.push( tagName );

      if ( handler.start ) {
        var attrs = [];

        rest.replace(attr, function(match, name) {
          var value = arguments[2] ? arguments[2] :
            arguments[3] ? arguments[3] :
            arguments[4] ? arguments[4] :
            fillAttrs[name] ? name : "";

          attrs.push({
            name: name,
            value: value,
            escaped: value.replace(/(^|[^\\])"/g, '$1\\\"') //"
          });
        });

        if ( handler.start )
          handler.start( tagName, attrs, unary );
      }
    }

    function parseEndTag( tag, tagName ) {
      // If no tag name is provided, clean shop
      if ( !tagName )
        var pos = 0;

      // Find the closest opened tag of the same type
      else
        for ( var pos = stack.length - 1; pos >= 0; pos-- )
          if ( stack[ pos ] == tagName )
            break;

      if ( pos >= 0 ) {
        // Close all the open elements, up the stack
        for ( var i = stack.length - 1; i >= pos; i-- )
          if ( handler.end )
            handler.end( stack[ i ] );

        // Remove the open elements from the stack
        stack.length = pos;
      }
    }
  };

  this.HTMLtoXML = function( html ) {
    var results = "";

    HTMLParser( html, {
      start: function( tagName, attrs, unary ) {
        results += "<" + tagName;

        for ( var i = 0; i < attrs.length; i++ )
          results += " " + attrs[i].name + '="' + attrs[i].escaped + '"';

        results += (unary ? "/" : "") + ">";
      },
      end: function( tagName ) {
        results += "</" + tagName + ">";
      },
      chars: function( text ) {
        results += text;
      },
      comment: function( text ) {
        results += "<!--" + text + "-->";
      }
    });

    return results;
  };

  this.HTMLtoDOM = function( html, doc ) {
    // Recieve data and pass it to HTMLParser
    HTMLParser( html, {
      start: function( tagName, attrs, unary ) {
        // If document is not defined, create one
        if ( !doc ) {
          doc = new XDocument();
        }

        // If there's no parent, then this is the root element
        if ( !doc.parent ) {
          var elem = doc.createElement( tagName );
          doc.parent = elem; // TODO: REMOVE THIS HACK
          doc.appendChild(elem); // TODO: Make this the only way
        } else {
          var elem = doc.createElement( tagName );
          doc.parent.appendChild(elem);
        }

        for ( var i = 0; i < attrs.length; i++ ) {
          var attr = doc.createAttribute( attrs[i].name );
          attr.value = attrs[i].value;
          elem.setAttributeNode( attr );
        }

        if ( !unary ) {
          elem.parent = doc.parent; // TODO: REMOVE THIS HACK
          doc.parent = elem;
        }
      },
      end: function( tagName ) {
        doc.parent = doc.parent.parent;
      },
      chars: function( text ) {
        doc.parent.appendChild( doc.createText( text ) );
      },
      comment: function( text ) {
        doc.parent.appendChild( doc.createComment( text ) );
      }
    });

    return doc;
  };

  function makeMap(str){
    var obj = {}, items = str.split(",");
    for ( var i = 0; i < items.length; i++ )
      obj[ items[i] ] = true;
    return obj;
  }
})();

module.exports = htmlparser.HTMLtoDOM;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./ternary-search-tree":2,"./xmltree":3}],2:[function(require,module,exports){
(function (global){
/**
 * @license
 * Ternary Search Tree
 *
 * Copyright (c) 2013 Matthew Dahl (http://matthewdahl.com)
 * Released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 */

'use strict';

var TernarySearchTree = (function() {
  var Node = function(val, parent) {
    this.val = val;
    this.parent = parent;
    this.data = null;
    this.left = null;
    this.middle = null;
    this.right = null;
    this.isEndOfWord = false;
  };

  Node.prototype.isLeaf = function() {
    return this.left === null && this.middle === null && this.right === null;
  };

  Node.prototype.isRoot = function() {
    return this.parent === null;
  };

  var TernarySearchTree = function(caseSensitive) {
    this._root = new Node(null, null); // sentinel
    this._caseSensitive = (caseSensitive === undefined) ? true : caseSensitive;
  };

  TernarySearchTree.prototype.add = function(word, data) {
    if (word === null || word === undefined || word.length === 0) {
      return;
    }

    if (!this._caseSensitive) {
      word = word.toLowerCase();
    }

    var curr = this._root;
    var i = 0;
    while (i < word.length) {
      if (curr.middle === null) {
        curr.middle = new Node(word[i], curr);
      }
      curr = curr.middle;
      while (i < word.length && curr.val !== word[i]) {
        if (word[i] < curr.val) {
          if (curr.left === null) {
            curr.left = new Node(word[i], curr);
          }
          curr = curr.left;
        } else {
          if (curr.right === null) {
            curr.right = new Node(word[i], curr);
          }
          curr = curr.right;
        }
      }
      i++;
    }

    curr.isEndOfWord = true;
    curr.data = data;
  };

  TernarySearchTree.prototype.remove = function(word) {
    if (word === null || word === undefined || word.length === 0) {
      return;
    }

    if (!this._caseSensitive) {
      word = word.toLowerCase();
    }

    var curr = this._root.middle; // root is sentinel
    var i = 0;
    var nodes = [];
    while(curr !== null && i < word.length) {
      nodes.push(curr);
      if (word[i] < curr.val) {
        curr = curr.left;
      } else if (word[i] > curr.val) {
        curr = curr.right;
      } else {
        if (i === word.length - 1) { // last character
          break;
        }
        curr = curr.middle;
        i++;
      }
    }

    if (curr === null || i !== word.length -1) { // word not in tree
      return;
    }

    if (!curr.isEndOfWord) { // word is a prefix, but not a word
      return;
    }

    // found the word, now remove it
    curr.isEndOfWord = false;
    curr.data = null;

    // if current node is not a leaf and it's not part of another word,
    // then we are done
    if (!curr.isLeaf() && curr.middle !== null) {
      return;
    }

    // current node is either a leaf, or it's not part of another word.
    // traverse up the tree and delete nodes that are not part of another word
    var child = curr;
    var parent = null;
    var val = '';
    for (var j=nodes.length-1; j >= 0; j--) {
      parent = nodes[j];
      val = child.val;

      // since we are traversing upwards, child must be either parent.left,
      // parent.middle, or parent.right.
      //
      // if child is parent.left, then we set parent.left to null.
      // if child is parent.middle, then we set parent.middle to null.
      // if child is parent.right, then we set parent.right to null.
      if (parent.left === child) {
        parent.left = null;
      } else if (parent.middle === child) {
        parent.middle = null;
      } else if (parent.right === child) {
        parent.right = null;
      } else {
        // this should not happen
        throw new Error('Problem removing node from TernarySearchTree.');
      }

      // if parent is part of another word, or it has other children, then
      // we are done
      if (parent.isEndOfWord || !parent.isLeaf()) {
        break;
      }

      child = parent;
    }
  };

  TernarySearchTree.prototype.contains = function(word) {
    if (word === null || word === undefined || word.length === 0) {
      return false;
    }

    if (!this._caseSensitive) {
      word = word.toLowerCase();
    }

    var curr = this._root.middle; // root is sentinel
    var i = 0;
    while(curr !== null && i < word.length) {
      if (word[i] < curr.val) {
        curr = curr.left;
      } else if (word[i] > curr.val) {
        curr = curr.right;
      } else {
        if (i === word.length - 1) { // last character
          return curr.isEndOfWord;
        }
        curr = curr.middle;
        i++;
      }
    }

    return false;
  };

  TernarySearchTree.prototype.get = function(word) {
    if (word === null || word === undefined || word.length === 0) {
      return null;
    }

    if (!this._caseSensitive) {
      word = word.toLowerCase();
    }

    var curr = this._root.middle; // root is sentinel
    var i = 0;
    while(curr !== null && i < word.length) {
      if (word[i] < curr.val) {
        curr = curr.left;
      } else if (word[i] > curr.val) {
        curr = curr.right;
      } else {
        if (i === word.length - 1) { // last character
          return curr.data;
        }
        curr = curr.middle;
        i++;
      }
    }

    return null;
  };

  TernarySearchTree.prototype.match = function(prefix, limit) {
    if (prefix === null || prefix === undefined || prefix.length === 0) {
      return [];
    }

    if (!this._caseSensitive) {
      prefix = prefix.toLowerCase();
    }

    if (limit === null || limit === undefined || limit <= 0) {
      limit = Infinity;
    }

    var curr = this._root.middle; // root is sentinel
    var i = 0;
    while(curr !== null && i < prefix.length) {
      if (prefix[i] < curr.val) {
        curr = curr.left;
      } else if (prefix[i] > curr.val) {
        curr = curr.right;
      } else {
        if (i === prefix.length - 1) { // last character of prefix
          break;
        }
        curr = curr.middle;
        i++;
      }
    }

    var words = [];
    if (curr !== null && i === prefix.length -1) { // prefix exists
      // if prefix itself is a word, add it to the results
      if (curr.isEndOfWord) {
        words.push({ word: prefix, data: curr.data });
      }

      // traverse the middle (suffix) subtree for more matches
      this._traverse(curr.middle, prefix, words, limit);
    }

    return words;
  };

  TernarySearchTree.prototype._traverse = function(curr, prefix, words, limit) {
    if (curr === null || words.length >= limit) {
      return;
    }

    // traverse left
    this._traverse(curr.left, prefix, words, limit);

    // capture word if we are at the end of a word and we haven't hit the limit
    if (curr.isEndOfWord && words.length < limit) {
      words.push({ word: prefix + curr.val, data: curr.data });
    }

    // traverse middle if we haven't hit the limit
    if (words.length < limit) {
      this._traverse(curr.middle, prefix + curr.val, words, limit);
    }

    // traverse right if we haven't hit the limit
    if (words.length < limit) {
      this._traverse(curr.right, prefix, words, limit);
    }
  };

  return TernarySearchTree;
})();

module.exports = TernarySearchTree;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
(function (global){
'use strict';

var XNode = function(type, ownerDocument, name, value) {
  this.nodeType = type;
  this.nodeName = name;
  this.nodeValue = value;
  this.childNodes = []; // TODO: Consider using TernarySearchTree for childNodes, attributes
  this.attributes = [];
  this.ownerDocument = ownerDocument;
  this.parentNode = null;
  this.previousSibling = null;
  this.nextSibling = null;
  this.firstChild = null;
  this.lastChild = null;
};

XNode.ELEMENT_NODE = 1;
XNode.ATTRIBUTE_NODE = 2;
XNode.TEXT_NODE = 3;
XNode.CDATA_SECTION_NODE = 4;
XNode.ENTITY_REFERENCE_NODE = 5;
XNode.ENTITY_NODE = 6;
XNode.PROCESSING_INSTRUCTION_NODE = 7;
XNode.COMMENT_NODE = 8;
XNode.DOCUMENT_NODE = 9;
XNode.DOCUMENT_TYPE_NODE = 10;
XNode.DOCUMENT_FRAGMENT_NODE = 11;
XNode.NOTATION_NODE = 12;

XNode.prototype.appendChild = function(newChild) {
  // TODO: Add validation to ensure newChild is not an ancestor of this node.
  // TODO: Add validation to ensure newChild is not of type XDocument.
  // TODO: Add validation to ensure newChild is not of type XAttribute if this node is not an XElement.

  if (newChild.parentNode) {
    newChild.parentNode.removeChild(newChild);
  }

  newChild.parentNode = this;

  if (this.lastChild) {
    this.lastChild.nextSibling = newChild;
    newChild.previousSibling = this.lastChild;
  } else {
    this.firstChild = newChild;
  }

  this.childNodes.push(newChild); // TODO: Remove direct access to childNodes array. Use tree properties (firstChild, nextSibling, etc)
  this.lastChild = newChild;

  return newChild;
};

XNode.prototype.insertBefore = function(newChild, refChild) {
  // TODO: Add validation to ensure newChild is not an ancestor of this node.
  // TODO: Add validation to ensure newChild is not of type XDocument.
  // TODO: Add validation to ensure newChild is not of type XAttribute if this node is not an XElement.
  // TODO: Add validation to ensure refChild is a child of this node.

  if (newChild.parentNode) {
    newChild.parentNode.removeChild(newChild);
  }

  newChild.parentNode = this;

  if (refChild) {
    newChild.previousSibling = refChild.previousSibling;
    newChild.nextSibling = refChild;

    if (refChild.previousSibling) {
      refChild.previousSibling.nextSibling = newChild;
    } else {
      this.firstChild = newChild;
    }
    refChild.previousSibling = newChild;

    // TODO: Remove direct access to childNodes array. Use tree properties (firstChild, nextSibling, etc)
    for(var i=0; i<this.childNodes.length; ++i) {
      if (this.childNodes[i] === refChild) {
        this.childNodes.splice(i, 0, newChild);
        break;
      }
    }
  } else { // If refChild is null, newChild is appended to the end of the list of children.
    this.appendChild(newChild);
  }

  return newChild;
};

XNode.prototype.replaceChild = function(newChild, oldChild) {
  // TODO: Add validation to ensure newChild is not an ancestor of this node.
  // TODO: Add validation to ensure newChild is not of type XDocument.
  // TODO: Add validation to ensure newChild is not of type XAttribute if this node is not an XElement.
  // TODO: Add validation to ensure oldChild is a child of this node.

  this.insertBefore(newChild, oldChild);
  this.removeChild(oldChild); // oldChild's parentNode will be null after this call.

  return oldChild;
};

XNode.prototype.removeChild = function(oldChild) {
  // TODO: Add validation to ensure oldChild is a child of this node.

  if (oldChild.previousSibling) {
    oldChild.previousSibling.nextSibling = oldChild.nextSibling;
  } else {
    this.firstChild = oldChild.nextSibling;
  }

  if (oldChild.nextSibling) {
    oldChild.nextSibling.previousSibling = oldChild.previousSibling;
  } else {
    this.lastChild = oldChild.previousSibling;
  }

  oldChild.parentNode = null;
  oldChild.previousSibling = null;
  oldChild.nextSibling = null;

  // TODO: Remove direct access to childNodes array. Use tree properties (firstChild, nextSibling, etc)
  for(var i=0; i<this.childNodes.length; ++i) {
    if (this.childNodes[i] === oldChild) {
      this.childNodes.splice(i, 1);
      break;
    }
  }

  return oldChild;
};

XNode.prototype.hasChildNodes = function() {
  return this.childNodes.length > 0;
};

XNode.prototype.cloneNode = function(deep) {
  var newNode = this.ownerDocument.createNode(this.nodeType, this.nodeName, this.nodeValue);
  // TODO: Consider copying XElement specific properties like prefix, localName, namespaceURI
  // TODO: Consider copying XAttribute specific properties like specified, ownerElement
  // TODO: Consider copying XDocumentType specific properties like name, entities, notations, publicId, systemId, internalSubset

  if (this.attributes && this.attributes.length > 0) {
    for(var i=0; i<this.attributes.length; ++i) {
      var attr = this.attributes[i].cloneNode(true);
      newNode.setAttributeNode(attr);
    }
  }

  if (deep && this.childNodes && this.childNodes.length > 0) {
    for(var i=0; i<this.childNodes.length; ++i) {
      var child = this.childNodes[i].cloneNode(true);
      newNode.appendChild(child);
    }
  }

  return newNode;
};

XNode.prototype.normalize = function() {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-normalize
  // Puts all Text nodes in the full depth of the sub-tree underneath this Node,
  // including attribute nodes, into a "normal" form where only structure
  // (e.g., elements, comments, processing instructions, CDATA sections, and
  // entity references) separates Text nodes, i.e., there are neither adjacent
  // Text nodes nor empty Text nodes.
};

XNode.prototype.isSupported = function(feature, version) {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#Level-2-Core-Node-supports
  // We will probably only support XML 1.0, so feature = 'XML', version = '1.0'
  return false;
};

XNode.prototype.hasAttributes = function() {
  return this.attributes.length > 0;
};

XNode.prototype.getFeature = function(feature, version) {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-getFeature
  // This method returns a specialized object which implements the specialized APIs of the specified feature and version, if any.
  return null;
};

XNode.prototype.setUserData = function(key, data, handler) {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-setUserData
  // Associate an object to a key on this node. The object can later be retrieved from this node by calling getUserData with the same key.
  // handler is called when the node is cloned, imported, or renamed.
};

XNode.prototype.getUserData = function(key) {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-getUserData
  // Retrieves the object associated to a key on a node. The object must first have been set to this node by calling setUserData with the same key.
  return null;
};

XNode.prototype.isSameNode = function(other) {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-isSameNode
  // Returns true if other is the same node as this node.
  return this === other;
};

XNode.prototype.isEqualNode = function(arg) {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-isEqualNode
  // Tests whether two nodes are equal.
  // This method tests for equality of nodes, not sameness (i.e., whether the two nodes are references to the same object) which can be tested with Node.isSameNode(). All nodes that are the same will also be equal, though the reverse may not be true.
  // Two nodes are equal if and only if the following conditions are satisfied:
  // - The two nodes are of the same type.
  // - The following string attributes are equal: nodeName, nodeValue, localName, namespaceURI, prefix.
  // - The attributes NamedNodeMaps are equal.
  // - The childNodes NodeLists are equal.
  return false;
};

XNode.prototype.lookupPrefix = function(namespaceURI) {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-lookupNamespacePrefix
  // Look up the prefix associated to the given namespace URI, starting from this node.
  return null;
};

XNode.prototype.lookupNamespaceURI = function(prefix) {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-lookupNamespaceURI
  // Look up the namespace URI associated to the given prefix, starting from this node.
  return null;
};

XNode.prototype.isDefaultNamespace = function(namespaceURI) {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-isDefaultNamespace
  // This method checks if the specified namespaceURI is the default namespace or not.
  return false;
};

var XText = function(ownerDocument, data) {
  XNode.call(this, XNode.TEXT_NODE, ownerDocument, '#text', data);
};
XText.prototype = new XNode();
XText.prototype.constructor = XText;

XText.prototype.splitText = function(offset) {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-38853C1D
  // Breaks this node into two nodes at the specified offset, keeping both in the tree as siblings.
  // After being split, this node will contain all the content up to the offset point.
  // A new node of the same type, which contains all the content at and after the offset point, is returned.
  // If the original node had a parent node, the new node is inserted as the next sibling of the original node.
  // When the offset is equal to the length of this node, the new node has no data.
  return null;
};

XText.prototype.isElementContentWhitespace = function() {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#Text3-isElementContentWhitespace
  // Returns whether this text node contains element content whitespace, often abusively called "ignorable whitespace".
  // The text node is determined to contain whitespace in element content during the load of the document or if validation occurs while using Document.normalizeDocument().
  return false;
};

XText.prototype.replaceWholeText = function(content) {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#Text3-replaceWholeText
  // Replaces the text of the current node and all logically-adjacent text nodes with the specified text.
  // All logically-adjacent text nodes are removed including the current node unless it was the recipient of the replacement text.
  // This method returns the node which received the replacement text. The returned node is:
  // - null, when the replacement text is the empty string;
  // - the current node, except when the current node is read-only;
  // - a new Text node of the same type (Text or CDATASection) as the current node inserted at the location of the replacement.
  return null;
};

XText.prototype.getWholeText = function() {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#Text3-getWholeText
  // Returns all text of Text nodes logically adjacent to this node, concatenated in document order.
  var text = '';
  // TODO: traverse previous siblings until not a text node.
  // TODO: traverse next siblings until not a text node.
  return text;
};

var XProcessingInstruction = function(ownerDocument, target, data) {
  XNode.call(this, XNode.PROCESSING_INSTRUCTION_NODE, ownerDocument, target, data);
  this.target = target;
  // TODO: data property on XProcessingInstruction is defined as nodeValue on XNode
};
XProcessingInstruction.prototype = new XNode();
XProcessingInstruction.prototype.constructor = XProcessingInstruction;

var XComment = function(ownerDocument, data) {
  XNode.call(this, XNode.COMMENT_NODE, ownerDocument, '#comment', data);
};
XComment.prototype = new XNode();
XComment.prototype.constructor = XComment;

var XAttribute = function(ownerDocument, name) {
  XNode.call(this, XNode.ATTRIBUTE_NODE, ownerDocument, name);
  // TODO: Consider prefix, localName, namespaceURI for XAttribute
  this.name = name; // TODO: name property on XAttribute is defined as nodeName on XNode
  this.specified = false; // TODO: specified property on XAttribute is defined as true if the attribute was explicitly given a value in the original document, false otherwise.
  this.ownerElement = null; // TODO: ownerElement property on XAttribute is the Element node this attribute is attached to or null if this attribute is not in use.
  // TODO: value property on XAttribute is defined as nodeValue on XNode
};
XAttribute.prototype = new XNode();
XAttribute.prototype.constructor = XAttribute;

var XElement = function(ownerDocument, tagName) {
  XNode.call(this, XNode.ELEMENT_NODE, ownerDocument, tagName);
  this.tagName = tagName; // TODO: tagName property on XElement is defined as nodeName on XNode
  // TODO: Consider prefix, localName, namespaceURI for XElement
};
XElement.prototype = new XNode();
XElement.prototype.constructor = XElement;

XElement.prototype.getAttribute = function(name) {
  for(var i=0; i<this.attributes.length; ++i) {
    if (this.attributes[i].name === name) {
      return this.attributes[i].value;
    }
  }
  return null; // TODO: Consider returning empty string for non-existing attributes, as per DOM spec.
};

XElement.prototype.setAttribute = function(name, value) {
  var attr = null;
  for(var i=0; i<this.attributes.length; ++i) {
    if (this.attributes[i].name === name) {
      attr = this.attributes[i];
      break;
    }
  }

  if (attr) {
    attr.value = value;
  } else {
    attr = this.ownerDocument.createAttribute(name);
    attr.value = value;
    this.setAttributeNode(attr);
  }
};

XElement.prototype.removeAttribute = function(name) {
  for(var i=0; i<this.attributes.length; ++i) {
    if (this.attributes[i].name === name) {
      this.removeAttributeNode(this.attributes[i]);
      break;
    }
  }
};

XElement.prototype.getAttributeNode = function(name) {
  for(var i=0; i<this.attributes.length; ++i) {
    if (this.attributes[i].name === name) {
      return this.attributes[i];
    }
  }
  return null;
};

XElement.prototype.setAttributeNode = function(newAttr) {
  // TODO: Add validation to ensure newAttr is not an ancestor of this node.
  // TODO: Add validation to ensure newAttr is not already an attribute of another XElement node.
  // TODO: If an attribute with that name (nodeName) is already present in the element, it is replaced by the new one.

  newAttr.ownerElement = this;
  this.attributes.push(newAttr); // TODO: Remove direct access to attributes array. Use tree properties.
  return newAttr; // TODO: If the newAttr attribute replaces an existing attribute with the same name, the replaced Attr node is returned, otherwise null is returned.
};

XElement.prototype.removeAttributeNode = function(oldAttr) {
  // TODO: Add validation to ensure oldAttr is an attribute of this node.

  for(var i=0; i<this.attributes.length; ++i) {
    if (this.attributes[i] === oldAttr) {
      this.attributes.splice(i, 1); // TODO: Remove direct access to attributes array. Use tree properties.
      oldAttr.ownerElement = null;
      return oldAttr;
    }
  }
  return null; // TODO: Throw an exception if oldAttr is not an attribute of this node.
};

XElement.prototype.getElementsByTagName = function(name) {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-1938918D
  // Returns a NodeList of all descendant Elements with a given tag name, in document order.
  // name can be '*' to match all tags.
  var elements = [];
  // TODO: Traverse childNodes recursively.
  return elements;
};

XElement.prototype.getAttributeNS = function(namespaceURI, localName) {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-ElGetAttrNS
  // Retrieves an attribute value by local name and namespace URI.
  return null;
};

XElement.prototype.setAttributeNS = function(namespaceURI, qualifiedName, value) {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-ElSetAttrNS
  // Adds a new attribute. If an attribute with the same local name and namespace URI is already present in the element, its prefix is changed to be the prefix part of the qualifiedName, and its value is changed to be the value parameter.
};

XElement.prototype.removeAttributeNS = function(namespaceURI, localName) {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-ElRemAtNS
  // Removes an attribute by local name and namespace URI. If a default value for the removed attribute is defined in the DTD, a new attribute immediately appears with the default value and the corresponding namespace URI, local name, and prefix when applicable.
};

XElement.prototype.getAttributeNodeNS = function(namespaceURI, localName) {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-ElGetAtNodeNS
  // Retrieves an Attr node by local name and namespace URI.
  return null;
};

XElement.prototype.setAttributeNodeNS = function(newAttr) {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-ElSetAtNodeNS
  // Adds a new attribute. If an attribute with that local name and that namespace URI is already present in the element, it is replaced by the new one.
  return null;
};

XElement.prototype.getElementsByTagNameNS = function(namespaceURI, localName) {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-A6C9094
  // Returns a NodeList of all the descendant Elements with a given local name and namespace URI in document order.
  return [];
};

XElement.prototype.hasAttribute = function(name) {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-ElHasAttr
  // Returns true when an attribute with a given name is specified on this element or has a default value, false otherwise.
  return false;
};

XElement.prototype.hasAttributeNS = function(namespaceURI, localName) {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-ElHasAttrNS
  // Returns true when an attribute with a given local name and namespace URI is specified on this element or has a default value, false otherwise.
  return false;
};

XElement.prototype.setIdAttribute = function(name, isId) {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-ElSetIdAttr
  // Declares the attribute specified by name to be of type ID. If the value of isId is true, this attribute is the user-determined ID attribute.
  // This affects the value of Attr.isId and the behavior of Document.getElementById, but does not change any schema that may be in use, in particular this does not affect the Attr.schemaTypeInfo of the specified Attr node.
  // Use the value false for isId to undeclare an attribute for being a user-determined ID attribute.
  // To specify an attribute by local name and namespace URI, use the setIdAttributeNS method.
};

XElement.prototype.setIdAttributeNS = function(namespaceURI, localName, isId) {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-ElSetIdAttrNS
  // Declares the attribute specified by local name and namespace URI to be of type ID. If the value of isId is true, this attribute is the user-determined ID attribute.
  // This affects the value of Attr.isId and the behavior of Document.getElementById, but does not change any schema that may be in use, in particular this does not affect the Attr.schemaTypeInfo of the specified Attr node.
  // Use the value false for isId to undeclare an attribute for being a user-determined ID attribute.
};

XElement.prototype.setIdAttributeNode = function(idAttr, isId) {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-ElSetIdAttrNode
  // Declares the attribute specified by node to be of type ID. If the value of isId is true, this attribute is the user-determined ID attribute.
  // This affects the value of Attr.isId and the behavior of Document.getElementById, but does not change any schema that may be in use, in particular this does not affect the Attr.schemaTypeInfo of the specified Attr node.
  // Use the value false for isId to undeclare an attribute for being a user-determined ID attribute.
};

XElement.prototype.getSchemaTypeInfo = function() {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#Element3-getSchemaTypeInfo
  // The type information associated with this element.
  return null;
};

var XDocument = function() {
  XNode.call(this, XNode.DOCUMENT_NODE, this, '#document'); // ownerDocument is this document
  this.doctype = null; // TODO: Consider DocumentType for doctype. Document.implementation.createDocumentType(qualifiedName, publicId, systemId)
  this.implementation = this; // TODO: Consider DOMImplementation for implementation. Document.implementation.hasFeature(feature, version)
  this.documentElement = null; // TODO: This is the root element of the document.
};
XDocument.prototype = new XNode();
XDocument.prototype.constructor = XDocument;

XDocument.prototype.createElement = function(tagName) {
  return new XElement(this, tagName);
};

XDocument.prototype.createDocumentFragment = function() {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-B63ED1A3
  // Creates an empty DocumentFragment object.
  return null;
};

XDocument.prototype.createTextNode = function(data) {
  return new XText(this, data);
};

XDocument.prototype.createComment = function(data) {
  return new XComment(this, data);
};

XDocument.prototype.createCDATASection = function(data) {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-D26C0AF8
  // Creates a CDATASection node whose value is the specified string.
  return null;
};

XDocument.prototype.createProcessingInstruction = function(target, data) {
  return new XProcessingInstruction(this, target, data);
};

XDocument.prototype.createAttribute = function(name) {
  return new XAttribute(this, name);
};

XDocument.prototype.createEntityReference = function(name) {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-392B75AE
  // Creates an EntityReference object. In addition, if the referenced entity is known, the child list of the EntityReference node is made the same as that of the corresponding Entity node.
  return null;
};

XDocument.prototype.getElementsByTagName = function(tagname) {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-A6C90962
  // Returns a NodeList of all the Elements in document order with a given tag name and are contained in the document.
  var elements = [];
  // TODO: Traverse childNodes recursively from documentElement.
  return elements;
};

XDocument.prototype.importNode = function(importedNode, deep) {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#Core-Document-importNode
  // Imports a node from another document to this document. The returned node has no parent; (parentNode is null). The source node is not altered or removed from the original document; this method creates a new copy of the source node.
  // For all nodes, importing a node creates a node object owned by the importing document, with attribute values identical to the source node's nodeName and nodeType, plus the attributes related to namespaces (prefix, localName, and namespaceURI). As in the cloneNode operation on a Node, the source node is not altered.
  // Additional information is copied as appropriate to the nodeType, attempting to mirror the behavior expected if a fragment of XML or HTML source was copied from one document to another, recognizing that the two documents may have different DTDs in the XML case.
  return null;
};

XDocument.prototype.createElementNS = function(namespaceURI, qualifiedName) {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-DocCrElNS
  // Creates an element of the given qualified name and namespace URI.
  return null;
};

XDocument.prototype.createAttributeNS = function(namespaceURI, qualifiedName) {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-DocCrAttrNS
  // Creates an attribute of the given qualified name and namespace URI.
  return null;
};

XDocument.prototype.getElementsByTagNameNS = function(namespaceURI, localName) {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-getElementsByTagNameNS
  // Returns a NodeList of all the Elements with a given local name and namespace URI in document order.
  return [];
};

XDocument.prototype.getElementById = function(elementId) {
  // TODO: Implement according to http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-getElBId
  // Returns the Element whose ID is given by elementId. If no such element exists, returns null.
  // The behavior is not defined if more than one element has this ID.
  // The DOM implementation is expected to use the attribute Attr.isId to determine if an attribute is of type ID.
  // Attributes with the name "ID" are not of type ID unless so defined.
  return null;
};

XDocument.prototype.createNode = function(type, name, value) { // Custom method, not part of DOM spec.
  switch(type) {
    case XNode.ELEMENT_NODE:
      return this.createElement(name);
    case XNode.ATTRIBUTE_NODE:
      return this.createAttribute(name);
    case XNode.TEXT_NODE:
      return this.createTextNode(value);
    case XNode.PROCESSING_INSTRUCTION_NODE:
      return this.createProcessingInstruction(name, value);
    case XNode.COMMENT_NODE:
      return this.createComment(value);
    default:
      return new XNode(type, this, name, value);
  }
};

XDocument.prototype.appendChild = function(newChild) { // Overriding XNode.prototype.appendChild
  if (newChild.nodeType === XNode.ELEMENT_NODE && this.documentElement) {
    // TODO: Throw an exception if a document already has a document element and newChild is an element.
    // TODO: Or should we replace the existing document element?
    // For now, we will allow multiple root elements, as we are parsing HTML fragments.
    // throw new Error("Document already has a document element.");
  }

  // TODO: Call super.appendChild(newChild)
  XNode.prototype.appendChild.call(this, newChild);

  if (newChild.nodeType === XNode.ELEMENT_NODE && !this.documentElement) {
    this.documentElement = newChild;
  }

  return newChild;
};

XDocument.prototype.toString = function() {
  // TODO: This is a custom method, not part of DOM spec.
  // TODO: Consider using XMLSerializer or something similar.
  var xml = '';
  for(var i=0; i<this.childNodes.length; ++i) {
    xml += nodeToString(this.childNodes[i]);
  }
  return xml;
};

function nodeToString(node) {
  if (node.nodeType === XNode.TEXT_NODE) {
    return node.nodeValue.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  } else if (node.nodeType === XNode.ELEMENT_NODE) {
    var xml = '<' + node.nodeName;
    for(var i=0; i<node.attributes.length; ++i) {
      xml += ' ' + node.attributes[i].name + '="' + node.attributes[i].value.replace(/"/g, '&quot;') + '"';
    }
    if (node.childNodes.length === 0) {
      // TODO: Check for self-closing tags based on HTML spec (e.g. <br />, <img />, etc.)
      // For now, we will assume all tags can have content.
      xml += '></' + node.nodeName + '>';
    } else {
      xml += '>';
      for(var i=0; i<node.childNodes.length; ++i) {
        xml += nodeToString(node.childNodes[i]);
      }
      xml += '</' + node.nodeName + '>';
    }
    return xml;
  } else if (node.nodeType === XNode.COMMENT_NODE) {
    return '<!--' + node.nodeValue + '-->';
  } else if (node.nodeType === XNode.PROCESSING_INSTRUCTION_NODE) {
    return '<?' + node.nodeName + ' ' + node.nodeValue + '?>';
  } else if (node.nodeType === XNode.DOCUMENT_NODE) {
    var xml = '';
    for(var i=0; i<node.childNodes.length; ++i) {
      xml += nodeToString(node.childNodes[i]);
    }
    return xml;
  } else {
    // TODO: Handle other node types.
    return '';
  }
}

module.exports.XNode = XNode;
module.exports.XText = XText;
module.exports.XProcessingInstruction = XProcessingInstruction;
module.exports.XComment = XComment;
module.exports.XAttribute = XAttribute;
module.exports.XElement = XElement;
module.exports.XDocument = XDocument;
module.exports.nodeToString = nodeToString;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
'use strict';

// refer to http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.14
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function indexOf(searchElement) {
    if (this === undefined || this === null) {
      throw new TypeError(this + ' is not an object');
    }

    var arraylike = this instanceof String ? this.split('') : this;
    var length = Math.max(Math.min(arraylike.length, 9007199254740991), 0) || 0;
    var start = Number(arguments[1]) || 0;
    start = (start < 0 ? Math.max(0, length + start) : start);

    for (var i = start; i < length; i++) {
      if (i in arraylike && arraylike[i] === searchElement) {
        return i;
      }
    }

    return -1;
  };
}
},{}],5:[function(require,module,exports){
'use strict';

// refer to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
if (!Array.isArray) {
  Array.isArray = function(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  };
}
},{}],6:[function(require,module,exports){
'use strict';

// refer to http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.18
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function forEach(callback, thisArg) {
    if (this === undefined || this === null) {
      throw new TypeError(this + ' is not an object');
    }

    var arraylike = this instanceof String ? this.split('') : this;
    var length = Math.max(Math.min(arraylike.length, 9007199254740991), 0) || 0;
    var i = -1;

    if (thisArg === undefined || thisArg === null) {
      while (++i < length) {
        if (i in arraylike) {
          callback(arraylike[i], i, arraylike);
        }
      }
    } else {
      while (++i < length) {
        if (i in arraylike) {
          callback.call(thisArg, arraylike[i], i, arraylike);
        }
      }
    }
  };
}
},{}],7:[function(require,module,exports){
'use strict';

// refer to http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.19
if (!Array.prototype.map) {
  Array.prototype.map = function map(callback, thisArg) {
    if (this === undefined || this === null) {
      throw new TypeError(this + ' is not an object');
    }

    var arraylike = this instanceof String ? this.split('') : this;
    var length = Math.max(Math.min(arraylike.length, 9007199254740991), 0) || 0;
    var result = new Array(length);
    var i = -1;

    if (thisArg === undefined || thisArg === null) {
      while (++i < length) {
        if (i in arraylike) {
          result[i] = callback(arraylike[i], i, arraylike);
        }
      }
    } else {
      while (++i < length) {
        if (i in arraylike) {
          result[i] = callback.call(thisArg, arraylike[i], i, arraylike);
        }
      }
    }

    return result;
  };
}
},{}],8:[function(require,module,exports){
'use strict';

// refer to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
if (!Object.create) {
  Object.create = (function() {
    var Temp = function() {};
    return function(prototype) {
      if (arguments.length > 1) {
        throw new Error('Object.create implementation only accepts the first parameter.');
      }
      if (typeof prototype !== 'object' && typeof prototype !== 'function') {
        throw new TypeError('Object prototype may only be an Object or null');
      }
      Temp.prototype = prototype;
      var result = new Temp();
      Temp.prototype = null; // prevent prototype pollution

      // Lacking other features of Object.create like defining properties directly.
      // TODO: Support propertiesObject argument.

      return result;
    };
  })();
}
},{}],9:[function(require,module,exports){
'use strict';

// refer to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
  Object.keys = (function() {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function(obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}
},{}],10:[function(require,module,exports){
'use strict';

// refer to http://www.ecma-international.org/ecma-262/5.1/#sec-15.2.3.14
if (!String.prototype.trim) {
  String.prototype.trim = function trim() {
    // Make sure we trim BOM and NBSP
    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    return this.replace(rtrim, '');
  };
}
},{}],11:[function(require,module,exports){
// Array.prototype.indexOf polyfill
require('./indexOf');

// Array.prototype.forEach polyfill
require('./forEach');

// Array.prototype.map polyfill
require('./map');

// Array.isArray polyfill
require('./isArray');

// Object.create polyfill
require('./create');

// Object.keys polyfill
require('./keys');

// String.prototype.trim polyfill
require('./trim');

},{"./create":8,"./forEach":6,"./indexOf":4,"./isArray":5,"./keys":9,"./map":7,"./trim":10}],12:[function(require,module,exports){
'use strict';

var relationshipContentTypes = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml',
  'application/vnd.openxmlformats-officedocument.theme+xml',
  'application/vnd.openxmlformats-officedocument.styles+xml',
  'application/vnd.openxmlformats-officedocument.settings+xml',
  'application/vnd.openxmlformats-officedocument.webSettings+xml',
  'application/vnd.openxmlformats-officedocument.fontTable+xml',
  'application/vnd.openxmlformats-package.relationships+xml'
];
var validRelationships = [
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties',
  'http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/header',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/webSettings',
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable'
];

var contentTypesField = '[Content_Types].xml';
var relationshipsField = '_rels/.rels';

var contentTypesToProcess = {
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml': processFile,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml': processFile,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml': processFile
};

function processFile(file, content) {
  // TODO: process the file content
  // For now, we are just returning the content as is.
  return content;
}

module.exports.contentTypesField = contentTypesField;
module.exports.relationshipsField = relationshipsField;
module.exports.relationshipContentTypes = relationshipContentTypes;
module.exports.validRelationships = validRelationships;
module.exports.contentTypesToProcess = contentTypesToProcess;

},{}],13:[function(require,module,exports){
(function (global){
'use strict';

var JSZip = (typeof global.JSZip !== 'undefined') ? global.JSZip : require('jszip');
var HTMLtoDOM = require('../htmltodom');
var xmlNode = require('../xmltree');
var prerender = require('./prerender');
var postrender = require('./postrender');
var documentGenerator = require('./document');
var contentTypesGenerator = require('./content-types');
var relationshipsGenerator = require('./relationships');
var headerFooterGenerator = require('./header-footer');
var imageHandler = require('./image-handler');
var styleHandler = require('./style-handler');
var hyperlinkHandler = require('./hyperlink-handler');
var tableHandler = require('./table-handler');
var listHandler = require('./list-handler');
var fontHandler = require('./font-handler');
var settingsHandler = require('./settings-handler');
var themeHandler = require('./theme-handler');
var webSettingsHandler = require('./web-settings-handler');
var docxTemplate = require('./template');

var HTMLtoOpenXML = function(htmlString, headerHTML, footerHTML, options) {
  var doc = new xmlNode.XDocument();
  var htmlDocument = HTMLtoDOM(htmlString, doc);
  var zip = new JSZip();

  options = options || {};
  options.orientation = options.orientation || 'portrait';
  options.margins = options.margins || { top: 1440, right: 1440, bottom: 1440, left: 1440, header: 720, footer: 720, gutter: 0 }; // 1 inch margins, 0.5 inch header/footer
  options.language = options.language || 'en-US';
  options.author = options.author || 'html-docx-js';
  options.creator = options.creator || 'html-docx-js';
  options.title = options.title || 'html-docx-js generated document';
  options.subject = options.subject || '';
  options.description = options.description || '';
  options.keywords = options.keywords || ['html-docx-js'];
  options.lastModifiedBy = options.lastModifiedBy || 'html-docx-js';
  options.revision = options.revision || '1';
  options.createdAt = options.createdAt || new Date();
  options.modifiedAt = options.modifiedAt || new Date();
  options.header = options.header || false;
  options.footer = options.footer || false;
  options.fontSize = options.fontSize || '12'; // in points
  options.font = options.font || 'Times New Roman';
  options.numbering = options.numbering || { // Default numbering style (decimal)
    template: '%1.',
    levels: [{
      level: 0,
      format: 'decimal',
      text: '%1.',
      style: {
        'w:pPr': {
          'w:numPr': {
            'w:ilvl': { '@val': '0' },
            'w:numId': { '@val': '1' } // Numbering definition ID
          }
        }
      }
    }]
  };
  options.styles = options.styles || ''; // Path to custom styles XML
  options.customNumbering = options.customNumbering || null; // Custom numbering definitions
  options.table = options.table || { // Default table style
    row: { cantSplit: false },
    cell: { margins: { top: 0, left: 108, bottom: 0, right: 108 } } // 0.075 inch left/right cell margins
  };
  options.pageNumber = options.pageNumber || null; // 'right' or 'center' or 'left', null for no page number
  options.pageSize = options.pageSize || { width: 12240, height: 15840 }; // 8.5 x 11 inches
  options.toc = options.toc || false; // Table of contents
  options.tocDepth = options.tocDepth || 3; // Default TOC depth
  options.smartQuotes = options.smartQuotes === undefined ? true : options.smartQuotes; // Use smart quotes

  // Pre-render steps (modifies htmlDocument)
  prerender(htmlDocument, options);

  // Initialize handlers
  imageHandler.init(zip, options);
  styleHandler.init(options);
  hyperlinkHandler.init(options);
  tableHandler.init(options);
  listHandler.init(options);
  fontHandler.init(options);
  settingsHandler.init(options);
  themeHandler.init(options);
  webSettingsHandler.init(options);

  // Generate main document content
  var mainDocument = documentGenerator.generate(htmlDocument, options);
  zip.file('word/document.xml', mainDocument);

  // Generate content types
  var contentTypes = contentTypesGenerator.generate(zip, options);
  zip.file(docxTemplate.contentTypesField, contentTypes);

  // Generate relationships
  var relationships = relationshipsGenerator.generate(zip, options);
  zip.file(docxTemplate.relationshipsField, relationships);

  // Generate header and footer
  if (options.header) {
    var header = headerFooterGenerator.generateHeader(headerHTML, options);
    zip.file('word/header1.xml', header);
    relationshipsGenerator.addRelationship(zip, 'word/document.xml', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/header', 'header1.xml');
    contentTypesGenerator.addContentType(zip, 'application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml', 'word/header1.xml');
  }
  if (options.footer) {
    var footer = headerFooterGenerator.generateFooter(footerHTML, options);
    zip.file('word/footer1.xml', footer);
    relationshipsGenerator.addRelationship(zip, 'word/document.xml', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer', 'footer1.xml');
    contentTypesGenerator.addContentType(zip, 'application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml', 'word/footer1.xml');
  }

  // Generate styles
  var styles = styleHandler.generateStylesXML();
  zip.file('word/styles.xml', styles);
  relationshipsGenerator.addRelationship(zip, 'word/document.xml', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles', 'styles.xml');
  contentTypesGenerator.addContentType(zip, 'application/vnd.openxmlformats-officedocument.styles+xml', 'word/styles.xml');

  // Generate fonts table
  var fontTable = fontHandler.generateFontTableXML();
  zip.file('word/fontTable.xml', fontTable);
  relationshipsGenerator.addRelationship(zip, 'word/document.xml', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable', 'fontTable.xml');
  contentTypesGenerator.addContentType(zip, 'application/vnd.openxmlformats-officedocument.fontTable+xml', 'word/fontTable.xml');

  // Generate settings
  var settings = settingsHandler.generateSettingsXML();
  zip.file('word/settings.xml', settings);
  relationshipsGenerator.addRelationship(zip, 'word/document.xml', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings', 'settings.xml');
  contentTypesGenerator.addContentType(zip, 'application/vnd.openxmlformats-officedocument.settings+xml', 'word/settings.xml');

  // Generate theme
  var theme = themeHandler.generateThemeXML();
  zip.file('word/theme/theme1.xml', theme);
  relationshipsGenerator.addRelationship(zip, 'word/document.xml', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme', 'theme/theme1.xml');
  contentTypesGenerator.addContentType(zip, 'application/vnd.openxmlformats-officedocument.theme+xml', 'word/theme/theme1.xml');

  // Generate web settings
  var webSettings = webSettingsHandler.generateWebSettingsXML();
  zip.file('word/webSettings.xml', webSettings);
  relationshipsGenerator.addRelationship(zip, 'word/document.xml', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/webSettings', 'webSettings.xml');
  contentTypesGenerator.addContentType(zip, 'application/vnd.openxmlformats-officedocument.webSettings+xml', 'word/webSettings.xml');

  // Generate core properties
  var coreProperties = documentGenerator.generateCoreProperties(options);
  zip.file('docProps/core.xml', coreProperties);
  relationshipsGenerator.addRelationship(zip, docxTemplate.relationshipsField, 'http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties', 'docProps/core.xml');

  // Generate extended properties
  var extendedProperties = documentGenerator.generateExtendedProperties(options);
  zip.file('docProps/app.xml', extendedProperties);
  relationshipsGenerator.addRelationship(zip, docxTemplate.relationshipsField, 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties', 'docProps/app.xml');

  // Post-render steps (modifies zip object)
  postrender(zip, options);

  // Return the zip object, which can be used to generate a blob or a base64 string
  return zip;
};

// Expose the public API
module.exports = HTMLtoOpenXML;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../htmltodom":1,"../xmltree":3,"./content-types":14,"./document":16,"./font-handler":17,"./header-footer":18,"./hyperlink-handler":19,"./image-handler":20,"./list-handler":21,"./postrender":22,"./prerender":23,"./relationships":24,"./settings-handler":25,"./style-handler":26,"./table-handler":27,"./template":12,"./theme-handler":28,"./web-settings-handler":29,"jszip":31}],14:[function(require,module,exports){
'use strict';

var xmlNode = require('../xmltree');
var template = require('./template');

var contentTypes = {}; // Keep track of content types to avoid duplicates

function addContentType(zip, contentType, partName) {
  if (!contentTypes[contentType]) {
    contentTypes[contentType] = [];
  }
  if (contentTypes[contentType].indexOf(partName) === -1) {
    contentTypes[contentType].push(partName);
  }
  // TODO: Update [Content_Types].xml if it already exists in the zip
}

function generateContentTypes(zip, options) {
  var doc = new xmlNode.XDocument();
  var typesNode = doc.createElement('Types');
  typesNode.setAttribute('xmlns', 'http://schemas.openxmlformats.org/package/2006/content-types');
  doc.appendChild(typesNode);

  // Default content types
  addDefaultContentType(typesNode, 'application/xml', 'xml');
  addDefaultContentType(typesNode, 'application/vnd.openxmlformats-package.relationships+xml', 'rels');

  // Process existing content types in the zip (e.g., images)
  for (var contentType in contentTypes) {
    if (contentTypes.hasOwnProperty(contentType)) {
      contentTypes[contentType].forEach(function(partName) {
        addOverrideContentType(typesNode, contentType, '/' + partName.replace(/^\//, ''));
      });
    }
  }

  // Ensure required content types are present
  ensureRequiredContentTypes(typesNode, options);

  return doc.toString();
}

function addDefaultContentType(typesNode, contentType, extension) {
  var defaultNode = typesNode.ownerDocument.createElement('Default');
  defaultNode.setAttribute('Extension', extension);
  defaultNode.setAttribute('ContentType', contentType);
  typesNode.appendChild(defaultNode);
}

function addOverrideContentType(typesNode, contentType, partName) {
  var overrideNode = typesNode.ownerDocument.createElement('Override');
  overrideNode.setAttribute('PartName', partName);
  overrideNode.setAttribute('ContentType', contentType);
  typesNode.appendChild(overrideNode);
}

function ensureRequiredContentTypes(typesNode, options) {
  // Ensure main document content type
  if (!hasOverride(typesNode, '/word/document.xml')) {
    addOverrideContentType(typesNode, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml', '/word/document.xml');
  }
  // Ensure core properties content type
  if (!hasOverride(typesNode, '/docProps/core.xml')) {
    addOverrideContentType(typesNode, 'application/vnd.openxmlformats-package.core-properties+xml', '/docProps/core.xml');
  }
  // Ensure extended properties content type
  if (!hasOverride(typesNode, '/docProps/app.xml')) {
    addOverrideContentType(typesNode, 'application/vnd.openxmlformats-officedocument.extended-properties+xml', '/docProps/app.xml');
  }
  // Ensure styles content type
  if (!hasOverride(typesNode, '/word/styles.xml')) {
    addOverrideContentType(typesNode, 'application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml', '/word/styles.xml');
  }
  // Ensure settings content type
  if (!hasOverride(typesNode, '/word/settings.xml')) {
    addOverrideContentType(typesNode, 'application/vnd.openxmlformats-officedocument.settings+xml', '/word/settings.xml');
  }
  // Ensure theme content type
  if (!hasOverride(typesNode, '/word/theme/theme1.xml')) {
    addOverrideContentType(typesNode, 'application/vnd.openxmlformats-officedocument.theme+xml', '/word/theme/theme1.xml');
  }
  // Ensure font table content type
  if (!hasOverride(typesNode, '/word/fontTable.xml')) {
    addOverrideContentType(typesNode, 'application/vnd.openxmlformats-officedocument.fontTable+xml', '/word/fontTable.xml');
  }
  // Ensure web settings content type
  if (!hasOverride(typesNode, '/word/webSettings.xml')) {
    addOverrideContentType(typesNode, 'application/vnd.openxmlformats-officedocument.webSettings+xml', '/word/webSettings.xml');
  }

  // Add header/footer content types if present
  if (options.header && !hasOverride(typesNode, '/word/header1.xml')) {
    addOverrideContentType(typesNode, 'application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml', '/word/header1.xml');
  }
  if (options.footer && !hasOverride(typesNode, '/word/footer1.xml')) {
    addOverrideContentType(typesNode, 'application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml', '/word/footer1.xml');
  }
}

function hasOverride(typesNode, partName) {
  var overrides = typesNode.childNodes;
  for (var i = 0; i < overrides.length; i++) {
    if (overrides[i].nodeName === 'Override' && overrides[i].getAttribute('PartName') === partName) {
      return true;
    }
  }
  return false;
}

module.exports.generate = generateContentTypes;
module.exports.addContentType = addContentType;

},{"../xmltree":3,"./template":12}],15:[function(require,module,exports){
'use strict';

// Helper functions for converting CSS styles to OpenXML properties

function convertCssToOpenXml(cssProperties) {
  var openXmlProperties = {};
  for (var prop in cssProperties) {
    if (cssProperties.hasOwnProperty(prop)) {
      var converter = cssToOpenXmlMap[prop];
      if (converter) {
        converter(cssProperties[prop], openXmlProperties);
      }
    }
  }
  return openXmlProperties;
}

var cssToOpenXmlMap = {
  'color': function(value, openXmlProps) {
    openXmlProps['w:color'] = { '@val': value.replace('#', '') };
  },
  'background-color': function(value, openXmlProps) {
    openXmlProps['w:shd'] = { '@w:val': 'clear', '@w:fill': value.replace('#', '') };
  },
  'font-family': function(value, openXmlProps) {
    openXmlProps['w:rFonts'] = { '@w:ascii': value, '@w:hAnsi': value, '@w:cs': value };
    // TODO: Add fallback fonts if specified (e.g., "Arial, sans-serif")
  },
  'font-size': function(value, openXmlProps) {
    // CSS font-size can be in px, pt, em, etc. OpenXML expects half-points.
    var sizeInPoints = convertToPoints(value);
    if (sizeInPoints) {
      openXmlProps['w:sz'] = { '@w:val': Math.round(sizeInPoints * 2) };
      openXmlProps['w:szCs'] = { '@w:val': Math.round(sizeInPoints * 2) }; // For complex scripts
    }
  },
  'font-weight': function(value, openXmlProps) {
    if (value === 'bold' || parseInt(value, 10) >= 700) {
      openXmlProps['w:b'] = { '@w:val': 'true' };
    }
  },
  'font-style': function(value, openXmlProps) {
    if (value === 'italic') {
      openXmlProps['w:i'] = { '@w:val': 'true' };
    }
  },
  'text-decoration': function(value, openXmlProps) {
    if (value.includes('underline')) {
      openXmlProps['w:u'] = { '@w:val': 'single' }; // TODO: Support other underline types
    }
    if (value.includes('line-through')) {
      openXmlProps['w:strike'] = { '@w:val': 'true' };
    }
  },
  'text-align': function(value, openXmlProps) {
    var alignmentMap = {
      'left': 'left',
      'right': 'right',
      'center': 'center',
      'justify': 'both'
    };
    if (alignmentMap[value]) {
      openXmlProps['w:jc'] = { '@w:val': alignmentMap[value] };
    }
  },
  'line-height': function(value, openXmlProps) {
    // OpenXML line-height is complex. This is a simplified conversion.
    // Value can be a number (multiplier), percentage, or length.
    // OpenXML expects value in twentieths of a point or 'auto', 'exact', 'atLeast'.
    if (!isNaN(parseFloat(value)) && isFinite(value)) { // Number (multiplier)
      openXmlProps['w:spacing'] = { '@w:lineRule': 'auto', '@w:line': Math.round(parseFloat(value) * 240) }; // 240 = 1 line in twentieths of a point
    } else if (value.endsWith('pt')) {
      var points = parseFloat(value);
      openXmlProps['w:spacing'] = { '@w:lineRule': 'exact', '@w:line': Math.round(points * 20) };
    } else if (value.endsWith('%')) {
      var percent = parseFloat(value);
      openXmlProps['w:spacing'] = { '@w:lineRule': 'auto', '@w:line': Math.round(percent / 100 * 240) };
    }
    // TODO: Handle 'normal', 'em', 'px'
  },
  'margin-top': function(value, openXmlProps) {
    var points = convertToPoints(value);
    if (points !== null) {
      openXmlProps['w:spacing'] = openXmlProps['w:spacing'] || {};
      openXmlProps['w:spacing']['@w:before'] = Math.round(points * 20);
    }
  },
  'margin-bottom': function(value, openXmlProps) {
    var points = convertToPoints(value);
    if (points !== null) {
      openXmlProps['w:spacing'] = openXmlProps['w:spacing'] || {};
      openXmlProps['w:spacing']['@w:after'] = Math.round(points * 20);
    }
  },
  'margin-left': function(value, openXmlProps) {
    var points = convertToPoints(value);
    if (points !== null) {
      openXmlProps['w:ind'] = openXmlProps['w:ind'] || {};
      openXmlProps['w:ind']['@w:left'] = Math.round(points * 20);
    }
  },
  'margin-right': function(value, openXmlProps) {
    var points = convertToPoints(value);
    if (points !== null) {
      openXmlProps['w:ind'] = openXmlProps['w:ind'] || {};
      openXmlProps['w:ind']['@w:right'] = Math.round(points * 20);
    }
  },
  'padding-top': function(value, openXmlProps) { // Used for table cells
    var points = convertToPoints(value);
    if (points !== null) {
      openXmlProps['w:tcMar'] = openXmlProps['w:tcMar'] || {};
      openXmlProps['w:tcMar']['w:top'] = { '@w:w': Math.round(points * 20), '@w:type': 'dxa' };
    }
  },
  'padding-bottom': function(value, openXmlProps) { // Used for table cells
    var points = convertToPoints(value);
    if (points !== null) {
      openXmlProps['w:tcMar'] = openXmlProps['w:tcMar'] || {};
      openXmlProps['w:tcMar']['w:bottom'] = { '@w:w': Math.round(points * 20), '@w:type': 'dxa' };
    }
  },
  'padding-left': function(value, openXmlProps) { // Used for table cells
    var points = convertToPoints(value);
    if (points !== null) {
      openXmlProps['w:tcMar'] = openXmlProps['w:tcMar'] || {};
      openXmlProps['w:tcMar']['w:left'] = { '@w:w': Math.round(points * 20), '@w:type': 'dxa' };
    }
  },
  'padding-right': function(value, openXmlProps) { // Used for table cells
    var points = convertToPoints(value);
    if (points !== null) {
      openXmlProps['w:tcMar'] = openXmlProps['w:tcMar'] || {};
      openXmlProps['w:tcMar']['w:right'] = { '@w:w': Math.round(points * 20), '@w:type': 'dxa' };
    }
  },
  'border': function(value, openXmlProps) { // Simplified border handling
    // Example: "1px solid black"
    var parts = value.split(' ');
    if (parts.length === 3) {
      var width = convertToPoints(parts[0]);
      var style = parts[1]; // e.g., solid, dotted
      var color = parts[2].replace('#', '');
      if (width !== null) {
        var borderType = mapBorderStyle(style);
        var borderObj = {
          'w:top': { '@w:val': borderType, '@w:sz': Math.round(width * 8), '@w:space': '0', '@w:color': color }, // sz is in eighths of a point
          'w:left': { '@w:val': borderType, '@w:sz': Math.round(width * 8), '@w:space': '0', '@w:color': color },
          'w:bottom': { '@w:val': borderType, '@w:sz': Math.round(width * 8), '@w:space': '0', '@w:color': color },
          'w:right': { '@w:val': borderType, '@w:sz': Math.round(width * 8), '@w:space': '0', '@w:color': color }
        };
        if (openXmlProps['w:pBdr']) { // Paragraph border
          openXmlProps['w:pBdr'] = Object.assign(openXmlProps['w:pBdr'], borderObj);
        } else if (openXmlProps['w:tcBorders']) { // Table cell border
          openXmlProps['w:tcBorders'] = Object.assign(openXmlProps['w:tcBorders'], borderObj);
        } else { // Default to paragraph border
           openXmlProps['w:pBdr'] = borderObj;
        }
      }
    }
  },
  // TODO: Add more specific border properties (border-top, border-color, etc.)
  'width': function(value, openXmlProps) {
    // Typically used for table cells or images.
    // OpenXML width can be in DXA (twentieths of a point) or percentage.
    if (value.endsWith('%')) {
      openXmlProps['w:w'] = { '@w:w': value, '@w:type': 'pct' };
    } else {
      var points = convertToPoints(value);
      if (points !== null) {
        openXmlProps['w:w'] = { '@w:w': Math.round(points * 20), '@w:type': 'dxa' };
      }
    }
  },
  'height': function(value, openXmlProps) {
    // Similar to width, but OpenXML height for table rows can also be 'atLeast' or 'exact'.
    var points = convertToPoints(value);
    if (points !== null) {
      // For table rows, this would be w:trPr/w:trHeight
      // For images, this would be part of the extent cx, cy
      // This generic converter might need context.
      // Assuming for now it's a generic height that might apply to an image's container or a table cell.
      openXmlProps['w:h'] = { '@w:val': Math.round(points * 20) }; // This is a simplification
    }
  },
  'vertical-align': function(value, openXmlProps) { // Mostly for table cells
    var alignMap = {
      'top': 'top',
      'middle': 'center',
      'bottom': 'bottom'
    };
    if (alignMap[value]) {
      openXmlProps['w:vAlign'] = { '@w:val': alignMap[value] };
    }
  }
  // Add more CSS property mappings as needed
};

function convertToPoints(cssValue) {
  if (typeof cssValue === 'number') return cssValue; // Assume it's already in points if a number
  if (typeof cssValue !== 'string') return null;

  if (cssValue.endsWith('pt')) {
    return parseFloat(cssValue);
  } else if (cssValue.endsWith('px')) {
    // Approximate conversion: 1px = 0.75pt (standard screen DPI assumption)
    return parseFloat(cssValue) * 0.75;
  } else if (cssValue.endsWith('em')) {
    // 'em' is relative to parent font size. Needs context. Assume 1em = 12pt for now.
    // This is a major simplification and should ideally be handled with context.
    var baseFontSize = 12; // Default assumption
    return parseFloat(cssValue) * baseFontSize;
  } else if (cssValue.endsWith('rem')) {
    // 'rem' is relative to root font size. Assume 1rem = 12pt for now.
    var rootFontSize = 12; // Default assumption
    return parseFloat(cssValue) * rootFontSize;
  } else if (cssValue.endsWith('in')) {
    return parseFloat(cssValue) * 72; // 1 inch = 72 points
  } else if (cssValue.endsWith('cm')) {
    return parseFloat(cssValue) * (72 / 2.54); // 1 cm = 72/2.54 points
  } else if (cssValue.endsWith('mm')) {
    return parseFloat(cssValue) * (72 / 25.4); // 1 mm = 72/25.4 points
  } else if (!isNaN(parseFloat(cssValue)) && isFinite(cssValue)) {
    return parseFloat(cssValue); // Assume points if unitless number
  }
  return null; // Cannot convert
}

function mapBorderStyle(cssStyle) {
  var styleMap = {
    'solid': 'single',
    'dotted': 'dotted',
    'dashed': 'dashed',
    'double': 'double',
    'groove': 'threeDEngrave', // Approximate
    'ridge': 'threeDEmboss',  // Approximate
    'inset': 'inset',
    'outset': 'outset',
    'none': 'nil',
    'hidden': 'nil'
  };
  return styleMap[cssStyle.toLowerCase()] || 'single'; // Default to solid
}

function parseStyleString(styleString) {
  var properties = {};
  if (!styleString) return properties;
  styleString.split(';').forEach(function(style) {
    style = style.trim();
    if (style) {
      var parts = style.split(':');
      if (parts.length >= 2) {
        var key = parts[0].trim();
        var value = parts.slice(1).join(':').trim();
        properties[key] = value;
      }
    }
  });
  return properties;
}

// Merges multiple OpenXML property objects (e.g., from different style sources)
function mergeOpenXmlProperties(arrayOfProps) {
  var merged = {};
  arrayOfProps.forEach(function(props) {
    for (var key in props) {
      if (props.hasOwnProperty(key)) {
        if (typeof props[key] === 'object' && props[key] !== null && !Array.isArray(props[key]) && merged[key] && typeof merged[key] === 'object') {
          // Deep merge for nested objects (like w:rFonts, w:spacing)
          merged[key] = Object.assign({}, merged[key], props[key]);
        } else {
          merged[key] = props[key];
        }
      }
    }
  });
  return merged;
}

module.exports = {
  convertCssToOpenXml: convertCssToOpenXml,
  parseStyleString: parseStyleString,
  convertToPoints: convertToPoints,
  mergeOpenXmlProperties: mergeOpenXmlProperties
};

},{}],16:[function(require,module,exports){
'use strict';

var xmlNode = require('../xmltree');
var cssConverter = require('./css-converter');
var imageHandler = require('./image-handler');
var hyperlinkHandler = require('./hyperlink-handler');
var tableHandler = require('./table-handler');
var listHandler = require('./list-handler');
var styleHandler = require('./style-handler');
var fontHandler = require('./font-handler'); // To register fonts

var currentListNumbering = {}; // Tracks current list level for nested lists

function generateDocument(htmlDoc, options) {
  var bodyContent = [];
  var doc = new xmlNode.XDocument(); // Temporary document for creating nodes

  // Process children of the HTML body
  var bodyNode = findBodyNode(htmlDoc);
  if (bodyNode && bodyNode.childNodes) {
    bodyNode.childNodes.forEach(function(node) {
      processNode(node, bodyContent, doc, options, {}); // Pass empty parent styles initially
    });
  }

  // Construct the w:document structure
  var documentXml = {
    'w:document': {
      '@xmlns:wpc': 'http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas',
      '@xmlns:mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
      '@xmlns:o': 'urn:schemas-microsoft-com:office:office',
      '@xmlns:r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
      '@xmlns:m': 'http://schemas.openxmlformats.org/officeDocument/2006/math',
      '@xmlns:v': 'urn:schemas-microsoft-com:vml',
      '@xmlns:wp14': 'http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing',
      '@xmlns:wp': 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
      '@xmlns:w10': 'urn:schemas-microsoft-com:office:word',
      '@xmlns:w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
      '@xmlns:w14': 'http://schemas.microsoft.com/office/word/2010/wordml',
      '@xmlns:w15': 'http://schemas.microsoft.com/office/word/2012/wordml',
      '@xmlns:wpg': 'http://schemas.microsoft.com/office/word/2010/wordprocessingGroup',
      '@xmlns:wpi': 'http://schemas.microsoft.com/office/word/2010/wordprocessingInk',
      '@xmlns:wne': 'http://schemas.microsoft.com/office/word/2006/wordml',
      '@xmlns:wps': 'http://schemas.microsoft.com/office/word/2010/wordprocessingShape',
      '@mc:Ignorable': 'w14 w15 wp14',
      'w:body': [
        bodyContent, // Array of processed content (paragraphs, tables, etc.)
        { 'w:sectPr': generateSectionProperties(options) }
      ]
    }
  };

  return xmlNode.nodeToString(documentXml);
}

function findBodyNode(doc) {
  // htmlDoc might be XDocument or XElement (if parsed from fragment)
  if (doc.nodeName === 'body') return doc;
  if (doc.documentElement && doc.documentElement.nodeName === 'html') {
    var html = doc.documentElement;
    for (var i = 0; i < html.childNodes.length; i++) {
      if (html.childNodes[i].nodeName === 'body') {
        return html.childNodes[i];
      }
    }
  }
  // If it's a fragment without a body tag, search for one or assume root is body-like
  if (doc.childNodes) {
    for (var i = 0; i < doc.childNodes.length; i++) {
        if (doc.childNodes[i].nodeName === 'body') return doc.childNodes[i];
    }
    // If no body tag, and it's a document node with children, assume children are body content
    if (doc.nodeType === xmlNode.XNode.DOCUMENT_NODE && doc.childNodes.length > 0) return doc;
  }
  return null; // Or return doc itself if it's a fragment root?
}


function processNode(node, outputArray, doc, options, parentStyles, listInfo) {
  var inheritedStyles = Object.assign({}, parentStyles);
  var localCssProps = {};
  if (node.getAttribute) { // Element nodes have attributes
      var styleAttr = node.getAttribute('style');
      if (styleAttr) {
          localCssProps = cssConverter.parseStyleString(styleAttr);
      }
  }
  var effectiveStyles = cssConverter.convertCssToOpenXml(localCssProps);
  var combinedStyles = cssConverter.mergeOpenXmlProperties([inheritedStyles, effectiveStyles]);

  switch (node.nodeName) {
    case 'p':
    case 'div': // Treat divs like paragraphs for now, could be more sophisticated
      var pNode = createParagraph(node, doc, options, combinedStyles, listInfo);
      outputArray.push(pNode);
      break;
    case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
      var headingNode = createHeading(node, doc, options, combinedStyles);
      outputArray.push(headingNode);
      break;
    case 'span': // Inline content, handled by createRun or within createParagraph
    case 'strong': case 'b':
    case 'em': case 'i':
    case 'u':
    case 's': case 'strike':
    case 'font': // Legacy tag, try to extract color, face, size
      // These are typically handled when creating runs within a paragraph.
      // If encountered directly, they might wrap a text node.
      // The logic in createParagraph and createRun should handle their styling.
      // If a block-level element contains only these, they'll apply to the text.
      break;
    case 'a': // Hyperlink
      // If 'a' is block level, create a paragraph for it. If inline, handled by createRun.
      // This simplified version assumes 'a' might be a block or handled by parent.
      var linkP = createParagraph(node, doc, options, combinedStyles, listInfo); // Will create runs with hyperlink
      outputArray.push(linkP);
      break;
    case 'img':
      var imgP = imageHandler.createImageParagraph(node, doc, options);
      if (imgP) outputArray.push(imgP);
      break;
    case 'table':
      var tableNode = tableHandler.createTable(node, doc, options, combinedStyles);
      if (tableNode) outputArray.push(tableNode);
      break;
    case 'ul':
    case 'ol':
      listHandler.processList(node, outputArray, doc, options, combinedStyles, listInfo);
      break;
    case 'li': // Should be handled by processList, but as a fallback:
      var listItemP = createParagraph(node, doc, options, combinedStyles, listInfo);
      outputArray.push(listItemP);
      break;
    case 'br':
      // Handled within createParagraph by creating a run with w:br
      break;
    case '#text':
      // If text node is a direct child of body (or processed node), wrap in paragraph
      if (node.nodeValue && node.nodeValue.trim() !== '') {
        var textP = {
          'w:p': [
            { 'w:pPr': {} }, // TODO: Apply default paragraph style if any
            createRun(node, doc, options, combinedStyles) // Pass combinedStyles
          ]
        };
        outputArray.push(textP);
      }
      break;
    case 'style': // Ignore style tags themselves, styles are pre-processed or applied via attributes
    case 'script': // Ignore script tags
      break;
    default:
      // For other block-level elements or unrecognized tags, try to process children
      if (node.childNodes && node.childNodes.length > 0) {
        // Create a generic paragraph to hold children if no specific handler
        var genericP = { 'w:p': [{ 'w:pPr': {} }] };
        node.childNodes.forEach(function(child) {
          processChildNodesAsRuns(child, genericP['w:p'], doc, options, combinedStyles, listInfo);
        });
        if (genericP['w:p'].length > 1) { // Has more than just pPr
             outputArray.push(genericP);
        }
      }
      break;
  }
}

function processChildNodesAsRuns(parentNode, outputRunArray, doc, options, parentPPr, listInfo) {
  if (parentNode.childNodes && parentNode.childNodes.length > 0) {
    parentNode.childNodes.forEach(function(childNode) {
      if (childNode.nodeName === '#text') {
        if (childNode.nodeValue && childNode.nodeValue.trim() !== '') {
          outputRunArray.push(createRun(childNode, doc, options, parentPPr));
        }
      } else if (isInlineElement(childNode.nodeName)) {
         // For inline elements, create a run and process its children recursively
         // to flatten them into the current paragraph's run array.
         var runsFromInline = createRun(childNode, doc, options, parentPPr, listInfo);
         if (Array.isArray(runsFromInline)) {
            outputRunArray.push.apply(outputRunArray, runsFromInline);
         } else {
            outputRunArray.push(runsFromInline);
         }
      } else {
        // If a block element is nested, it should ideally be handled by processNode
        // and create a new paragraph. This path is more of a fallback.
        // For now, skip block children here as they should form new w:p elements.
      }
    });
  } else if (parentNode.nodeName === '#text') { // parentNode itself is a text node
     if (parentNode.nodeValue && parentNode.nodeValue.trim() !== '') {
        outputRunArray.push(createRun(parentNode, doc, options, parentPPr));
     }
  }
}

function isInlineElement(tagName) {
    var inlineElements = ['span', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'font', 'a', 'img', 'br', '#text'];
    return inlineElements.indexOf(tagName.toLowerCase()) !== -1;
}

function createParagraph(pSourceNode, doc, options, inheritedPPr, listInfo) {
  var pChildren = [];
  var pPr = { 'w:pPr': [] }; // Initialize as an array to push style objects

  // Apply paragraph style if specified (e.g., from a class or list item)
  var paragraphStyleId = styleHandler.getStyleId(pSourceNode, 'p');
  if (paragraphStyleId) {
    pPr['w:pPr'].push({ 'w:pStyle': { '@w:val': paragraphStyleId } });
  }

  // Apply inherited styles (e.g., from parent div or list)
  if (inheritedPPr) {
    pPr['w:pPr'].push(inheritedPPr);
  }

  // Process local styles from 'style' attribute of the paragraph
  var styleAttr = pSourceNode.getAttribute ? pSourceNode.getAttribute('style') : null;
  if (styleAttr) {
    var localCssProps = cssConverter.parseStyleString(styleAttr);
    var localOpenXmlProps = cssConverter.convertCssToOpenXml(localCssProps);
    pPr['w:pPr'].push(localOpenXmlProps); // Add to the array of properties
  }

  // Consolidate pPr: if it's an array of objects, merge them.
  // The mergeOpenXmlProperties expects an array of property objects.
  // If pPr['w:pPr'] contains actual property objects, use them.
  var finalPPrObject = cssConverter.mergeOpenXmlProperties(pPr['w:pPr']);
  pPr = { 'w:pPr': finalPPrObject }; // Reassign to the expected object structure

  // Add numbering properties if it's a list item
  if (listInfo && listInfo.numId && listInfo.level !== undefined) {
    pPr['w:pPr']['w:numPr'] = {
      'w:ilvl': { '@w:val': listInfo.level.toString() },
      'w:numId': { '@w:val': listInfo.numId.toString() }
    };
    // Ensure a paragraph style for list items if not already set
    if (!pPr['w:pPr']['w:pStyle']) {
        var listStyle = options.numbering && options.numbering.defaultParagraphStyle ? options.numbering.defaultParagraphStyle : "ListParagraph";
        // styleHandler.ensureStyle(listStyle, "paragraph", { basedOn: "Normal" }); // Ensure ListParagraph style exists
        pPr['w:pPr']['w:pStyle'] = { '@w:val': listStyle };
    }
  }


  // Process children of the paragraph node to create runs
  if (pSourceNode.childNodes && pSourceNode.childNodes.length > 0) {
    pSourceNode.childNodes.forEach(function(child) {
      var runs = createRun(child, doc, options, {}, listInfo); // Pass empty rPr for now, let createRun handle it
      if (Array.isArray(runs)) {
        pChildren.push.apply(pChildren, runs);
      } else {
        pChildren.push(runs);
      }
    });
  } else if (pSourceNode.nodeName === '#text' && pSourceNode.nodeValue) { // Handle case where pSourceNode is just a text node
      var textRun = createRun(pSourceNode, doc, options, {}, listInfo);
      pChildren.push(textRun);
  }


  // If paragraph is empty or only contains whitespace, add a run with a single space
  // to ensure it renders correctly in Word. Word sometimes collapses empty paragraphs.
  // However, an empty <w:p/> is also valid. Let's be careful not to add space if it's intentionally empty for spacing.
  // For now, let Word handle empty <w:p></w:p>. If issues arise, uncomment below.
  /*
  if (pChildren.every(run => run['w:r'] && run['w:r'][1] && run['w:r'][1]['w:t'] && run['w:r'][1]['w:t'].trim() === '')) {
      pChildren.push({ 'w:r': [ {'w:rPr': {}}, {'w:t': {'@xml:space': 'preserve', '#text': ' '}} ]});
  }
  */

  return { 'w:p': [pPr, ...pChildren] };
}


function createRun(rSourceNode, doc, options, inheritedRPr, listInfo) {
  var rPr = { 'w:rPr': [] }; // Initialize as an array for merging
  var runs = []; // A single rSourceNode (like a <span> with children) can produce multiple runs

  // Apply inherited run properties (e.g., from parent span)
  if (inheritedRPr) {
    rPr['w:rPr'].push(inheritedRPr);
  }

  // Apply styles from specific HTML tags
  switch (rSourceNode.nodeName) {
    case 'strong': case 'b':
      rPr['w:rPr'].push({ 'w:b': { '@w:val': 'true' } });
      break;
    case 'em': case 'i':
      rPr['w:rPr'].push({ 'w:i': { '@w:val': 'true' } });
      break;
    case 'u':
      rPr['w:rPr'].push({ 'w:u': { '@w:val': 'single' } });
      break;
    case 's': case 'strike':
      rPr['w:rPr'].push({ 'w:strike': { '@w:val': 'true' } });
      break;
    case 'font': // Handle font tag attributes
      var fontProps = {};
      if (rSourceNode.getAttribute('color')) {
        fontProps['w:color'] = { '@w:val': rSourceNode.getAttribute('color').replace('#', '') };
      }
      if (rSourceNode.getAttribute('face')) {
        var fontName = rSourceNode.getAttribute('face');
        fontProps['w:rFonts'] = { '@w:ascii': fontName, '@w:hAnsi': fontName, '@w:cs': fontName };
        fontHandler.registerFont(fontName); // Register font for font table
      }
      if (rSourceNode.getAttribute('size')) {
        // HTML font size is 1-7. Word uses points. Approximate mapping.
        var htmlSize = parseInt(rSourceNode.getAttribute('size'));
        var pointSize = convertHtmlFontSizeToPoints(htmlSize); // Implement this helper
        if (pointSize) {
          fontProps['w:sz'] = { '@w:val': pointSize * 2 }; // Half-points
          fontProps['w:szCs'] = { '@w:val': pointSize * 2 };
        }
      }
      rPr['w:rPr'].push(fontProps);
      break;
  }

  // Apply styles from 'style' attribute
  var styleAttr = rSourceNode.getAttribute ? rSourceNode.getAttribute('style') : null;
  if (styleAttr) {
    var localCssProps = cssConverter.parseStyleString(styleAttr);
    var localOpenXmlRPr = cssConverter.convertCssToOpenXml(localCssProps); // This will filter for run-level props
    rPr['w:rPr'].push(localOpenXmlRPr);

    // Register font if specified in style
    if (localCssProps['font-family']) {
        fontHandler.registerFont(localCssProps['font-family']);
    }
  }

  // Apply style ID if class is present
  var styleId = styleHandler.getStyleId(rSourceNode, 'character'); // Assuming 'character' type for spans etc.
  if (styleId) {
      rPr['w:rPr'].push({ 'w:rStyle': { '@w:val': styleId }});
  }

  // Consolidate rPr
  var finalRPrObject = cssConverter.mergeOpenXmlProperties(rPr['w:rPr']);
  var finalRPr = { 'w:rPr': finalRPrObject };

  // Handle specific node types for run content
  if (rSourceNode.nodeName === '#text') {
    var textContent = rSourceNode.nodeValue;
    if (options.smartQuotes) {
        textContent = convertToSmartQuotes(textContent);
    }
    // Preserve spaces if they are significant (e.g. multiple spaces, leading/trailing for a run)
    var spaceAttr = needsSpacePreservation(textContent) ? { '@xml:space': 'preserve' } : {};
    return { 'w:r': [finalRPr, { 'w:t': Object.assign(spaceAttr, {'#text': textContent}) }] };
  } else if (rSourceNode.nodeName === 'br') {
    return { 'w:r': [finalRPr, { 'w:br': {} }] };
  } else if (rSourceNode.nodeName === 'a' && rSourceNode.getAttribute('href')) {
    var hyperlinkRuns = hyperlinkHandler.createHyperlinkRuns(rSourceNode, doc, options, finalRPrObject);
    // createHyperlinkRuns returns an array of w:hyperlink objects, or plain runs if no href.
    // We expect a single run or an array of runs here.
    // If it's a full w:hyperlink object, it's more than just a run.
    // This needs careful integration. For now, assume createHyperlinkRuns returns an array of <w:r> compatible structures.
    // This might mean createHyperlink should return the <w:hyperlink> object itself if it's to be inserted directly.
    // Let's assume for now createHyperlink is called at paragraph level.
    // If 'a' is processed as a run, its children become runs *within* the hyperlink.
    var hyperlinkContent = [];
    if (rSourceNode.childNodes && rSourceNode.childNodes.length > 0) {
        rSourceNode.childNodes.forEach(function(child) {
            var childRuns = createRun(child, doc, options, finalRPrObject, listInfo); // Inherit link's style
            if (Array.isArray(childRuns)) hyperlinkContent.push.apply(hyperlinkContent, childRuns);
            else hyperlinkContent.push(childRuns);
        });
    } else if (rSourceNode.textContent) { // Link with text but no child nodes
        var textNode = doc.createTextNode(rSourceNode.textContent);
        hyperlinkContent.push(createRun(textNode, doc, options, finalRPrObject, listInfo));
    }

    return hyperlinkHandler.createHyperlinkObject(rSourceNode.getAttribute('href'), hyperlinkContent, options);

  } else if (rSourceNode.nodeName === 'img') {
      // Images are usually block (paragraph with drawing), but can be inline.
      // If createRun encounters an img, it means it's intended to be inline.
      // This is a simplified path; full image handling is in imageHandler.createImageParagraph
      var inlineImageRun = imageHandler.createInlineImageRun(rSourceNode, doc, options);
      if (inlineImageRun) {
          // Merge existing rPr with image's rPr if any (e.g., if img is inside a styled span)
          // For now, assume inlineImageRun's rPr is self-contained or doesn't need merging here.
          return inlineImageRun;
      }
      return { 'w:r': [finalRPr, {'w:t': '[Image]'}] }; // Placeholder if inline creation fails
  } else if (rSourceNode.childNodes && rSourceNode.childNodes.length > 0) {
    // For elements like <span>, <strong>, etc., that contain other nodes or text
    rSourceNode.childNodes.forEach(function(child) {
      // Recursively call createRun for children, inheriting the current run's properties
      var childRuns = createRun(child, doc, options, finalRPrObject, listInfo);
      if (Array.isArray(childRuns)) {
        runs.push.apply(runs, childRuns);
      } else {
        runs.push(childRuns);
      }
    });
    return runs; // Return array of runs
  } else {
    // Empty run, or unknown inline element. Could return an empty run or skip.
    // An empty run might be { 'w:r': [finalRPr] } if we want to preserve a styled empty space.
    return { 'w:r': [finalRPr] }; // Return an empty run with properties, might be collapsed by Word.
  }
}

function convertHtmlFontSizeToPoints(htmlSize) {
    // Standard HTML font sizes 1-7. Default is 3.
    // Approximate mapping to points. This can vary by browser/settings.
    var sizeMap = {
        1: 8,  // ~xx-small
        2: 10, // ~x-small
        3: 12, // ~small (Default)
        4: 14, // ~medium
        5: 18, // ~large
        6: 24, // ~x-large
        7: 36  // ~xx-large
    };
    return sizeMap[htmlSize] || null;
}

function needsSpacePreservation(text) {
    // Check if text starts or ends with a space, or contains multiple consecutive spaces.
    return text.startsWith(' ') || text.endsWith(' ') || text.includes('  ');
}


function createHeading(hNode, doc, options, inheritedPPr) {
  var level = parseInt(hNode.nodeName.substring(1));
  var pChildren = [];
  var pPr = { 'w:pPr': [] };

  // Apply heading style (e.g., "Heading1", "Heading2")
  var headingStyleId = styleHandler.getStyleId(hNode, 'paragraph') || 'Heading' + level;
  styleHandler.ensureStyleId(headingStyleId, 'paragraph', { name: `Heading ${level}`, basedOn: "Normal", next: "Normal", runProps: { 'w:b': {'@w:val': 'true'} } }); // Basic default
  pPr['w:pPr'].push({ 'w:pStyle': { '@w:val': headingStyleId } });


  // Apply inherited styles
  if (inheritedPPr) {
    pPr['w:pPr'].push(inheritedPPr);
  }

  // Process local styles
  var styleAttr = hNode.getAttribute('style');
  if (styleAttr) {
    var localCssProps = cssConverter.parseStyleString(styleAttr);
    var localOpenXmlProps = cssConverter.convertCssToOpenXml(localCssProps);
    pPr['w:pPr'].push(localOpenXmlProps);
  }

  var finalPPrObject = cssConverter.mergeOpenXmlProperties(pPr['w:pPr']);
  pPr = { 'w:pPr': finalPPrObject };

  // Add TOC outline level if options.toc is enabled
  if (options.toc && level <= options.tocDepth) {
      pPr['w:pPr']['w:outlineLvl'] = { '@w:val': (level - 1).toString() };
  }

  // Process children to create runs
  if (hNode.childNodes && hNode.childNodes.length > 0) {
    hNode.childNodes.forEach(function(child) {
      var runs = createRun(child, doc, options, {}); // Headings usually define their own run styles via pStyle
      if (Array.isArray(runs)) {
        pChildren.push.apply(pChildren, runs);
      } else {
        pChildren.push(runs);
      }
    });
  }

  return { 'w:p': [pPr, ...pChildren] };
}


function generateSectionProperties(options) {
  var sectPr = {
    'w:pgSz': {
      '@w:w': options.pageSize.width.toString(),   // e.g., 12240 for 8.5in
      '@w:h': options.pageSize.height.toString(),  // e.g., 15840 for 11in
      '@w:orient': options.orientation // "portrait" or "landscape"
    },
    'w:pgMar': {
      '@w:top': options.margins.top.toString(),
      '@w:right': options.margins.right.toString(),
      '@w:bottom': options.margins.bottom.toString(),
      '@w:left': options.margins.left.toString(),
      '@w:header': options.margins.header.toString(),
      '@w:footer': options.margins.footer.toString(),
      '@w:gutter': options.margins.gutter.toString()
    },
    'w:cols': { '@w:space': '720' }, // Default column spacing, equivalent to 0.5 inch
    'w:docGrid': { '@w:linePitch': '360' } // Default line pitch
  };

  // Add header and footer references if they exist
  if (options.header) {
    sectPr['w:headerReference'] = { '@w:type': 'default', '@r:id': relationshipsGenerator.getRelationshipId(null, 'word/header1.xml') }; // Assuming rId is known or managed
  }
  if (options.footer) {
    sectPr['w:footerReference'] = { '@w:type': 'default', '@r:id': relationshipsGenerator.getRelationshipId(null, 'word/footer1.xml') }; // Assuming rId is known or managed
  }
  if (options.pageNumber) { // e.g. options.pageNumber = "right" or "center"
      // This implies footer needs to be generated with page number field
      // The sectPr itself doesn't place the page number, but a footer reference is needed.
      // If no custom footer but page numbers are on, a default footer with page number might be assumed by some generators.
      // For this library, ensure options.footer is true and footerHTML includes a page number placeholder,
      // or headerFooterGenerator handles options.pageNumber directly.
      if (!options.footer) {
          // If page numbers are requested but no footer is explicitly set,
          // we might need to create a default footer part just for page numbers.
          // This depends on how headerFooterGenerator is designed.
          // For now, assume if options.pageNumber is set, options.footer should also be true.
      }
  }


  return sectPr;
}

function generateCoreProperties(options) {
  var now = new Date().toISOString();
  var coreProps = {
    'cp:coreProperties': {
      '@xmlns:cp': 'http://schemas.openxmlformats.org/package/2006/metadata/core-properties',
      '@xmlns:dc': 'http://purl.org/dc/elements/1.1/',
      '@xmlns:dcterms': 'http://purl.org/dc/terms/',
      '@xmlns:dcmitype': 'http://purl.org/dc/dcmitype/',
      '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      'dc:title': options.title || '',
      'dc:subject': options.subject || '',
      'dc:creator': options.creator || 'html-docx-js',
      'cp:keywords': (options.keywords || []).join(', '),
      'dc:description': options.description || '',
      'cp:lastModifiedBy': options.lastModifiedBy || 'html-docx-js',
      'cp:revision': options.revision || '1',
      'dcterms:created': {
        '@xsi:type': 'dcterms:W3CDTF',
        '#text': options.createdAt ? options.createdAt.toISOString() : now
      },
      'dcterms:modified': {
        '@xsi:type': 'dcterms:W3CDTF',
        '#text': options.modifiedAt ? options.modifiedAt.toISOString() : now
      }
    }
  };
  return xmlNode.nodeToString(coreProps);
}

function generateExtendedProperties(options) {
  // Simplified, Word typically includes more like total pages, words, chars etc. but these are usually updated by Word on open.
  var appProps = {
    'Properties': {
      '@xmlns': 'http://schemas.openxmlformats.org/officeDocument/2006/extended-properties',
      '@xmlns:vt': 'http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes',
      'Application': 'Microsoft Office Word', // Or whatever app generated it
      'DocSecurity': '0',
      'ScaleCrop': 'false',
      'HeadingPairs': {
        'vt:vector': {
          '@size': '2', '@baseType': 'variant',
          'vt:variant': [ { 'vt:lpstr': 'Title' } ], // Example, Word populates this dynamically
          'vt:variant': [ { 'vt:i4': '1' } ]
        }
      },
      'TitlesOfParts': {
        'vt:vector': {
          '@size': '1', '@baseType': 'lpstr',
          'vt:lpstr': [options.title || '']
        }
      },
      'Company': options.company || '',
      'LinksUpToDate': 'false',
      'SharedDoc': 'false',
      'HyperlinksChanged': 'false',
      'AppVersion': '16.0000' // Example version (Word 2016/365)
    }
  };
  return xmlNode.nodeToString(appProps);
}

function convertToSmartQuotes(text) {
    if (!text) return text;
    return text
        .replace(/(^|[-\u2014\s(\["])'/g, "$1\u2018") // Opening single quote
        .replace(/'/g, "\u2019") // Closing single quote & apostrophe
        .replace(/(^|[-\u2014\s(\["])
