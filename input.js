var oled = require('oled-i2c-bus')
  , font = require('oled-font-5x7');

var input = function(opts,callback){
  this.opts = opts;
  this.oled = new oled(opts.bus, this.opts.display);
  this.gpio = opts.gpio;
  this.pins = opts.pins;
  this.characters = [0,0,0,0];
  this.currentCharacter = 0;
  this.title = opts.title;
  this.callback = callback;
  return this
}

input.prototype.draw = function(){
  if(!this.active) return false;
  var oled = this.oled;
  oled.clearDisplay(false);
  oled.fillRect(0,0,128,11,1,false);
  oled.fillRect(1,1,126,9,0,false);
  oled.setCursor(2,2);
  oled.writeString(font,1,this.title,1,false,false);
  var current = this.currentCharacter;
  this.characters.forEach(function(element,i){
    oled.setCursor(i*12+2,12);
    oled.writeString(font,2,element.toString(),1,false,false);
    if(i==current){
      oled.drawLine(i*12+1,27,i*12+12,27,1,false);
    }
  });
  oled.update();
  return this;
}

input.prototype.runInput = function(last){
  this.oled.stopScroll();
  var menu = this;
  if(this.gpio){
    var gpio = this.gpio;
    gpio.poll(this.pins.up,function(){menu.up()},gpio.POLL_HIGH);
    gpio.poll(this.pins.down,function(){menu.down()},gpio.POLL_HIGH);
    gpio.poll(this.pins.back,function(){menu.back()},gpio.POLL_HIGH);
    gpio.poll(this.pins.next,function(){menu.next()},gpio.POLL_HIGH);
    gpio.poll(this.pins.enter,function(){menu.enter()},gpio.POLL_HIGH);
  };
  this.active = true;
  this.draw();
  return this;
}

input.prototype.up = function(){
  if(!this.active) return false;
  ++this.characters[this.currentCharacter];
  if(this.characters[this.currentCharacter] > 9) this.characters[this.currentCharacter] = 0;
  this.draw();
  return this;
}

input.prototype.down = function(){
  if(!this.active) return false;
  --this.characters[this.currentCharacter];
  if(this.characters[this.currentCharacter] < 0) this.characters[this.currentCharacter] = 9;
  this.draw();
  return this;
}

input.prototype.back = function(){
  if(!this.active) return false;
  --this.currentCharacter;
  if(this.currentCharacter < 0){
    this.currentCharacter = 0;
  }

  this.draw();
  return this;
}

input.prototype.next = function(){
  if(!this.active) return false;
  ++this.currentCharacter;
  if(this.currentCharacter > this.characters.length - 1){
    this.currentCharacter = this.characters.length - 1;
  }
  this.draw();
  return this;
}

input.prototype.enter = function(){
  if(!this.active) return false;
  var output = "";
  this.characters.forEach(function(element){
    output = output + element.toString();
  });
  this.close();
  this.callback(output);
  return this;
}

input.prototype.close = function(){
  if(!this.active) return false;
  console.log("closing menu");
  this.oled.clearDisplay();
  this.oled.update();
  this.active = false;
  if(this.gpio){
    var gpio = this.gpio;
    gpio.poll(this.pins.up,null);
    gpio.poll(this.pins.down,null);
    gpio.poll(this.pins.enter,null);
    gpio.poll(this.pins.back,null);
    gpio.poll(this.pins.next,null);
  };
  return this;
}
  

module.exports = input;
