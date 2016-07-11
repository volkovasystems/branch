"use strict";

/*:
	@module-license:
		The MIT License (MIT)
		@mit-license

		Copyright (@c) 2016 Richeve Siodina Bebedor
		@email: richeve.bebedor@gmail.com

		Permission is hereby granted, free of charge, to any person obtaining a copy
		of this software and associated documentation files (the "Software"), to deal
		in the Software without restriction, including without limitation the rights
		to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
		copies of the Software, and to permit persons to whom the Software is
		furnished to do so, subject to the following conditions:

		The above copyright notice and this permission notice shall be included in all
		copies or substantial portions of the Software.

		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
		IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
		FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
		AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
		LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
		OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
		SOFTWARE.
	@end-module-license

	@module-configuration:
		{
			"package": "branch",
			"path": "branch/branch.js",
			"file": "branch.js",
			"module": "branch",
			"author": "Richeve S. Bebedor",
			"eMail": "richeve.bebedor@gmail.com",
			"repository": "https://github.com/volkovasystems/branch.git",
			"global": true,
			"class": true
		}
	@end-module-configuration

	@module-documentation:
	@end-module-documentation

	@include:
		{
			"harden": "harden"
		}
	@end-include
*/

if( typeof window != "undefined" &&
	!( "harden" in window ) )
{
	throw new Error( "harden is not defined" );
}

harden( "FIRM", "firm" );
harden( "FLAT", "flat" );
harden( "MAXIMUM_BAR_INDEX", 2147483647 );
harden( "MAXIMUM_BAR_LEVEL", 2147483647 );
harden( "MINIMUM_BAR_INDEX", 1073741823 );
harden( "MINIMUM_BAR_LEVEL", 1073741823 );

/*:
	@option:
		{
			"name:required": "string",
			"index": "number",
			"level": "number",
			"group": "string",
			"position": [
				"firm",
				"flat"
			]
		}
	@end-option
*/
var branch = function branch( option ){
	/*:
		@meta-configuration:
			{
				"option:required": [
					"object",
					"string"
				]
			}
		@end-meta-configuration
	*/

	if( !branch.BOOTED ){
		throw new Error( "branch is not loaded properly" );
	}

	var parameter = arguments[ 0 ];
	if( typeof parameter == "string" &&
		parameter in branch.bar )
	{
		return branch.bar[ parameter ];

	}else if( typeof parameter == "string" ){
		option = { "name": parameter };

	}else{
		option = option || { };
	}

	var name = option.name;
	if( !name ){
		throw new Error( "name not specified" );
	}

	var bar = document.createElement( "div" );
	bar.classList.add( "bar" );

	bar.setAttribute( "name", name );
	bar.classList.add( name );

	var group = option.group || "root";

	var view = document.querySelector( "section.view." + group );
	if( !view ){
		throw new Error( "view does not exists" );
	}

	if( document.querySelector( "section.view." + group + " > div.bar." + name ) ){
		throw new Error( "bar is already in the given group" );
	}

	harden( group, branch.group[ group ] || { }, branch.group );
	harden( group, branch.data.group[ group ] || { }, branch.data.group );

	if( branch.group[ group ][ name ] ){
		throw new Error( "bar is already in the given group" );
	}

	var position = option.position || FIRM;
	if( position == FIRM ){
		bar.style.height = "100%";
		bar.classList.add( FIRM );

	}else if( position == FLAT ){
		bar.style.width = "100%";
		bar.classList.add( FLAT );

	}else{
		throw new Error( "unknown position" );
	}

	var level = option.level || 0;
	if( level > MAXIMUM_BAR_LEVEL ){
		throw new Error( "maximum bar level" );
	}

	var index = option.index || 0;
	if( index > MAXIMUM_BAR_INDEX ){
		throw new Error( "maximum bar index" );
	}

	bar.setAttribute( "group", group );
	bar.classList.add( group );

	branch.resolveGroup( {
		"group": group,
		"index": index,
		"level": level,
		"name": name,
		"bar": bar
	} );

	bar.setAttribute( "style", [
		"display: flex;",
		"flex-direction: row;",

		"position: absolute;",

		"border: 0;",
		"padding: 0px;",
		"margin: 0px;",

		"float: none;",

		"pointer-events: none;"
	].join( " " ) );

	bar.classList.add( "hidden" );

	harden( name, bar, branch.bar );

	view.appendChild( bar );

	return bar;
};

/*:
	This will be the collection of bars.

	No indexes will be on this bar.
*/
harden( "bar", branch.bar || { }, branch );

harden( "data", branch.data || { }, branch );
harden( "group", branch.data.group || { }, branch.data );

/*:
	This will be a collection of bar groups.
	Each group is a collection of bars.

	A group can be synonymous to views.

	Groups represent a parent element where the bar
		is contained.

	Groups will contain the names and indexes of the bar.
*/
harden( "group", branch.group || { }, branch );

//: This will be the group when the bar is not given any group.
harden( "root", branch.group.root || { }, branch.group );

harden( "boot",
	function boot( ){
		if( !document.querySelector( "style.root" ) ){
			var style = document.createElement( "style" );

			style.setAttribute( "name", "root" );
			style.classList.add( "root" );
			style.appendChild( document.createTextNode( "" ) );
			document.head.appendChild( style );

			harden( "sheet", style.sheet, branch );

		}else{
			var sheet = document.querySelector( "style.root" ).sheet;
			if( sheet ){
				harden( "sheet", sheet, branch );

			}else{
				throw new Error( "cannot find root style" );
			}
		}

		try{
			branch.sheet.insertRule( ".hidden" + JSON.stringify( {
				"display": "none !important",

				"width": "0px !important",
				"height": "0px !important",

				"opacity": "hidden !important",

				"pointer-events": "none !important"
			} )
			.replace( /\,/g, ";" )
			.replace( /\"/g, "" ), 0 );

			branch.sheet.insertRule( "div.bar" + JSON.stringify( {
				"display": "flex !important",

				"position": "absolute !important",

				"border": "0 !important",
				"padding": "0px !important",
				"margin": "0px !important",

				"float": "none !important",

				"pointer-events": "none !important"
			} )
			.replace( /\,/g, ";" )
			.replace( /\"/g, "" ), 0 );

			branch.sheet.insertRule( "div.bar.firm" + JSON.stringify( {
				"height": "100% !important"
			} )
			.replace( /\,/g, ";" )
			.replace( /\"/g, "" ), 0 );

			branch.sheet.insertRule( "div.bar.flat" + JSON.stringify( {
				"width": "100% !important"
			} )
			.replace( /\,/g, ";" )
			.replace( /\"/g, "" ), 0 );

		}catch( error ){
			console.debug( "unexpected error when inserting rule", error );
		}

		harden( "BOOTED", "booted", branch );

		return branch;
	}, branch );

harden( "show",
	function show( name ){
		if( name in branch.bar ){
			var bar = branch.bar[ name ];

			bar.classList.remove( "hidden" );

			var level = parseInt( bar.getAttribute( "level" ) );
			bar.style.zIndex = level;

		}else{
			console.debug( "cannot find bar", name );
		}

		return branch;
	}, branch );

harden( "hide",
	function hide( name ){
		if( name in branch.bar ){
			branch.bar[ name ].classList.add( "hidden" );

		}else{
			console.debug( "cannot find bar", name );
		}

		return branch;
	}, branch );

/*:
	@method-documentation:
		We separated the complicated procedure of resolving the group index.
	@end-method-documentation

	@option:
		{
			"name": "string",
			"group": "string",
			"bar": "HTMLElement",
			"index": "number",
			"level": "number"
		}
	@end-option
*/
harden( "resolveGroup",
	function resolveGroup( option ){
		var name = option.name;

		if( !name ){
			throw new Error( "name not specified" );
		}

		var group = option.group;

		if( !group ){
			throw new Error( "group not specified" );
		}

		harden( group, branch.group[ group ] || { }, branch.group );

		var bar = option.bar || branch.group[ group ][ name ] || branch.bar[ name ];

		if( !bar ){
			throw new Error( "bar not specified" );
		}

		harden( group, branch.data.group[ group ] || { }, branch.data.group );

		/*:
			This is the current count of the bars in the group from zero.
			This may represent the current count of bars in the group.
		*/
		var groupIndex = option.index || branch.data.group[ group ].index || MINIMUM_BAR_INDEX;
		if( groupIndex > MAXIMUM_BAR_INDEX ){
			groupIndex = MINIMUM_BAR_INDEX;
		}

		/*:
			This is the stationary high value index and
				does not represent the curent count of the bars in a group.
		*/
		var lastIndex = branch.data.group[ group ].last || MINIMUM_BAR_INDEX;
		if( lastIndex > MAXIMUM_BAR_INDEX ){
			lastIndex = MINIMUM_BAR_INDEX;
		}

		var level = option.level || groupIndex

		//: The given level overrides the current group index.
		groupIndex = level;

		//: The last index may be the group index but it will change because of the given level.
		if( groupIndex > lastIndex ){
			lastIndex = groupIndex;
		}

		var index = MINIMUM_BAR_INDEX;
		while( branch.group[ group ][ index ] ){
			index++;
		}
		if( index > MAXIMUM_BAR_INDEX ){
			throw new Error( "group is full" );
		}
		/*:
			The last index may not be the last one based on the registered bars in the group.

			This will confuse anyone in the future, we did this because
				we will never know what is the last index. It is safe to assume
				that the last index can be at the last space or/and with the highest value.
		*/
		if( lastIndex > index ){
			lastIndex = index;
		}

		var oldIndex = parseInt( bar.getAttribute( "index" ) );

		//: Group index must not be occupied.
		while( branch.group[ group ][ groupIndex ] ){
			//: If the group index and last index is equal and it is occupied then move one index.
			if( branch.group[ group ][ groupIndex ] &&
				lastIndex == groupIndex )
			{
				lastIndex++;

			//: If the group index and last index is occupied then move both one index.
			}else if( branch.group[ group ][ groupIndex ] &&
				branch.group[ group ][ lastIndex ] &&
				lastIndex != groupIndex )
			{
				if( option.index &&
					option.index < oldIndex )
				{
					groupIndex--;

				}else{
					groupIndex++;
				}

				lastIndex++;
			}

			if( groupIndex <= 0 ){
				throw new Error( "minimum group index" );
			}

			if( groupIndex > MAXIMUM_BAR_INDEX ){
				throw new Error( "group is full" );
			}

			if( lastIndex > MAXIMUM_BAR_INDEX ){
				throw new Error( "group is full" );
			}

			/*:
				If the given last index is not occupied
					and the group index is occupied replace them over
					and free the group index.
			*/
			if( branch.group[ group ][ groupIndex ] &&
				!branch.group[ group ][ lastIndex ] &&
				lastIndex > groupIndex )
			{
				branch.group[ group ][ lastIndex ] = branch.group[ group ][ groupIndex ];
				branch.group[ group ][ groupIndex ] = null;
			}
		}

		if( !( name in branch.group[ group ] ) ){
			harden( name, bar, branch.group[ group ] );
		}

		if( branch.group[ group ][ oldIndex ] === bar ){
			delete branch.group[ group ][ oldIndex ];
		}
		branch.group[ group ][ groupIndex ] = bar;

		//: For bars, level and index must be the same in most cases.
		level = groupIndex;
		bar.setAttribute( "index", groupIndex );
		bar.setAttribute( "level", level );
		bar.style.zIndex = level;

		var index = MINIMUM_BAR_INDEX;
		while( branch.group[ group ][ index ] ){
			index++;
		}
		if( index > MAXIMUM_BAR_INDEX ){
			throw new Error( "group is full" );
		}
		//: The current group index must be empty.
		branch.data.group[ group ].index = index;

		var nextIndex = MINIMUM_BAR_INDEX;
		Object.keys( branch.data.group[ group ] )
			.filter( function onEachKey( key ){
				return ( /^\d+$/ ).test( key.toString( ) );
			} )
			.forEach( function onEachIndex( index ){
				index = parseInt( index );

				if( index > nextIndex ){
					nextIndex = index;
				}
			} );
		if( nextIndex > MAXIMUM_BAR_INDEX ){
			throw new Error( "group is full" );
		}
		//: The highest value index is the last index.
		branch.data.group[ group ].last = nextIndex;

		return branch;
	}, branch );

/*:
	@method-documentation:
		This will arrange the z-index of the bars based on their index.
	@end-method-documentation
*/
harden( "cascade",
	function cascade( group ){
		group = group || "root";

		var view = document.querySelector( "section.view." + group );
		if( !view ){
			throw new Error( "view does not exists" );
		}

		if( !branch.data.group[ group ] ){
			console.debug( "cannot find group", group );

			return branch;
		}

		Object.keys( branch.data.group[ group ] )
			.filter( function onEachKey( key ){
				return ( /^\d+$/ ).test( key.toString( ) );
			} )
			.forEach( function onEachIndex( index ){
				index = parseInt( index );

				var bar = branch.group[ group ][ index ];

				bar.setAttribute( "level", index );
				bar.setAttribute( "index", index );

				var viewLevel = parseInt( view.getAttribute( "level" ) );
				bar.style.zIndex = viewLevel * index;
			} );

		return branch;
	}, branch );

/*:
	@method-documentation:
		Change the position of the bar.
	@end-method-documentation
*/
harden( "position",
	function position( name, position ){
		if( !name ){
			throw new Error( "name not specified" );
		}

		var bar = branch.bar[ name ];
		bar.classList.remove( FIRM );
		bar.classList.remove( FLAT );

		position = position || FIRM;
		if( position == FIRM ){
			bar.style.height = "100%";
			bar.classList.add( FIRM );

		}else if( position == FLAT ){
			bar.style.width = "100%";
			bar.classList.add( FLAT );

		}else{
			throw new Error( "unknown position" );
		}

		return branch;
	}, branch );

/*:
	@method-documentation:
		Drop the level of the bar.
	@end-method-documentation
*/
harden( "drop",
	function drop( name ){
		if( !name ){
			throw new Error( "name not specified" );
		}

		var bar = branch.bar[ name ];
		var group = bar.getAttribute( "group" );

		branch.cascade( group );

		var index = parseInt( bar.getAttribute( "index" ) );
		index--;

		branch.resolveGroup( {
			"name": name,
			"group": group,
			"bar": bar,
			"index": index
		} );

		branch.cascade( group );

		return branch;
	}, branch );

/*:
	@method-documentation:
		Pump up the level of the bar.
	@end-method-documentation
*/
harden( "pump",
	function pump( name ){
		if( !name ){
			throw new Error( "name not specified" );
		}

		var bar = branch.bar[ name ];
		var group = bar.getAttribute( "group" );

		branch.cascade( group );

		var index = parseInt( bar.getAttribute( "index" ) );
		index++;

		branch.resolveGroup( {
			"name": name,
			"group": group,
			"bar": bar,
			"index": index
		} );

		branch.cascade( group );

		return branch;
	}, branch );
