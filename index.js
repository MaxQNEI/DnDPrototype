'use strict';

window.addEventListener('load', DnDController);

function DnDController(Parameters) {
  if(!(this instanceof DnDController)) {
    return new DnDController(Parameters);
  }

  var Trash = document.querySelector('.trash');
  var Field = document.querySelector('.field');
  var DnDWrap = document.querySelector('.dnd-wrap');
  var RowList = document.querySelectorAll('.row');
  var PaperList = document.querySelectorAll('.row .paper');

  return (function Construct() {

    Field.parentElement.removeChild(Field);
    Field.classList.remove('template');

    var drag = null;
    var placeholder = null;
    var remove = false;
    var swap = null;
    var moveBefore = null;
    var moveAfter = null;
    var wmx, wmy;

    window.addEventListener('dragstart', LockEvent);
    window.addEventListener('selectstart', LockEvent);

    window.addEventListener('mousemove', function(event) {
      wmx = event.clientX;
      wmy = event.clientY;

      if(!drag) { return; }

      drag.updPos2XY(wmx, wmy);
    });

    window.addEventListener('mouseup', function() {
      // Remove
      if(remove) {
        drag.parentElement.removeChild(drag);
        placeholder.parentElement.removeChild(placeholder);
        drag = null;
      }

      // Move before/after
      if(moveBefore || moveAfter) {
        if(moveBefore) {
          moveBefore.parentElement.insertBefore(drag, moveBefore);
        }

        if(moveAfter) {
          moveAfter.parentElement.insertBefore(drag, moveAfter);
          moveAfter.parentElement.insertBefore(moveAfter, drag);
        }

        moveBefore = null
        moveAfter = null
        swap = null;
      }

      // Swap
      if(swap) {
        swap.parentElement.insertBefore(drag, swap);
        placeholder.parentElement.insertBefore(swap, placeholder);
        swap.style.removeProperty('filter');
      }

      // Drag
      if(drag) {
        placeholder.parentElement.removeChild(placeholder);
        drag.disattach();
      }

      // Recalculate
      Object.values(RowList).some(function(row) {
        if(!row.querySelectorAll('.paper').length) {
          row.parentElement.removeChild(row);
        }
      });

      PaperList = document.querySelectorAll('.paper');
      RowList = document.querySelectorAll('.row');

      // Clear
      drag = null;
      swap = null;
      remove = false;

      // Clear
      for(let i = 0, ls = DnDWrap.querySelectorAll('.paper.over'); i < ls.length; i++) {
        ls[i].classList.remove('over');
      }

      for(let i = 0, ls = DnDWrap.querySelectorAll('.paper.show-field'); i < ls.length; i++) {
        ls[i].classList.remove('show-field');
      }

      // Hide
      Trash.classList.remove('show');
    });

    Trash.addEventListener('mouseover', function(event) {
      remove = true;
    });

    Trash.addEventListener('mouseout', function(event) {
      remove = false;
    });

    Object.values(RowList).some(function(row, index) {
      row.addEventListener('mouseover', function(event) {
      });

      row.addEventListener('mouseout', function(event) {

      });
    });

    Object.values(PaperList).some(function(paper, index) {
      var fieldBefore = Field.cloneNode(true);
      var fieldAfter = Field.cloneNode(true);

      fieldBefore.classList.add('before');
      fieldAfter.classList.add('after');

      paper.insertBefore(fieldBefore, (paper.children[0] || null));
      paper.appendChild(fieldAfter);


      paper.querySelector('.info').textContent = ('#'+ (index + 1));

      Object.defineProperties(paper, {
        disattach: { enumerable: true, value: function disattach() {
          this.classList.remove('drag');
          this.style.removeProperty('top');
          this.style.removeProperty('left');
          this.style.removeProperty('width');
          this.style.removeProperty('height');

          return this;
        } },

        updPos2XY: { enumerable: true, value: function updPos2XY(x, y) {
          Object.assign(this.style, {
            top: ((y - (this.offsetHeight / 2)) +'px'),
            left: ((x - (this.offsetWidth / 2)) +'px'),
          });

          return this;
        } },
      });

      paper.addEventListener('mousedown', function() {
        wmx = event.clientX;
        wmy = event.clientY;

        if(drag) { return; }

        Trash.classList.add('show');

        drag = paper;
        Object.assign(drag.style, {
          width: (drag.offsetWidth +'px'),
          height: (drag.offsetHeight +'px'),
        });

        placeholder = paper.cloneNode(false);
        placeholder.classList.add('placeholder');
        Object.assign(placeholder.style, {
          width: (paper.offsetWidth +'px'),
          height: (paper.offsetHeight +'px'),
        });
        drag.parentElement.insertBefore(placeholder, drag);


        drag.classList.add('drag');


        drag.updPos2XY(wmx, wmy);
      });

      paper.addEventListener('mouseover', function(event) {
        if(!drag) { return; }

        swap = paper;
        swap.classList.add('over');
        placeholder.classList.add('swap');

        paper.classList.add('show-field');
      });

      fieldBefore.addEventListener('mouseover', function(event) {

        moveBefore = paper;
      });

      fieldAfter.addEventListener('mouseover', function(event) {

        moveAfter = paper;
      });

      fieldBefore.addEventListener('mouseout', function(event) {

        moveBefore = null;
      });

      fieldAfter.addEventListener('mouseout', function(event) {

        moveAfter = null;
      });

      paper.addEventListener('mouseout', function(event) {
        if(swap === paper) {
          swap.classList.remove('over');
          swap = null;
        }

        paper.classList.remove('show-field');
      });
    });

    return null;
  })();

  function LockEvent(event) {
    event.preventDefault();
  }

  function rand(a, b) {
    return Math.round(Math.random() * (b - a) + a);
  }
}
