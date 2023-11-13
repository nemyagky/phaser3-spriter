import {LineStepper} from "./LineStepper";
import {Spriter} from "./Spriter";
import {SpriterBone} from "./SpriterBone";
import {SpriterObject} from "./SpriterObject";
import {Animation} from "./Structure/Animation";
import {eTimelineType} from "./Structure/Baseline";
import {CharMapStack} from "./Structure/CharMapStack";
import {Entity} from "./Structure/Entity";
import {Key} from "./Structure/Key";
import {KeyMainline} from "./Structure/KeyMainline";
import {KeyTag} from "./Structure/KeyTag";
import {KeyVariable} from "./Structure/KeyVariable";
import {Ref} from "./Structure/Ref";
import {SpatialInfo} from "./Structure/SpatialInfo";
import {eObjectType} from "./Structure/Types";
import {Variable} from "./Structure/Variable";
import {Varline} from "./Structure/Varline";
import EventEmitter = Phaser.Events.EventEmitter;


interface SpriterContainerOptions {
  scene: Phaser.Scene;
  animation: Spriter;
  atlasKey: string;
  defaultCharacter: string;
  defaultAnimationName: string;
}


export class SpriterContainer extends Phaser.GameObjects.Container {

  // onLoop(SpriterGroup);
  public onLoop = new EventEmitter()
  // onFinish(SpriterGroup);
  public onFinish = new EventEmitter()

  // onSound(SpriterGroup, string); // string for line name which equals soud name without extension
  public onSound = new EventEmitter()
  // onEvent(SpriterGroup, string); // string for line name which equals event name
  public onEvent = new EventEmitter()
  // onTagChange(SpriterGroup, string, boolean); // string for tag name, boolean for change (true = set / false = unset)
  public onTagChange = new EventEmitter()
  // onVariableSet(SpriterGroup, Variable); // Variable is Spriter variable def with access to value
  public onVariableSet = new EventEmitter()
  // onBoxUpdated(SpriterGroup, SpriterObject);
  public onBoxUpdated = new EventEmitter()
  // onPointUpdated(SpriterGroup, SpriterObject);
  public onPointUpdated = new EventEmitter()

  private _spriter: Spriter;
  private _textureKey: string;

  private _entity: Entity;
  private _entityName: string;
  private _animation: Animation;
  private _animationName: string;
  private _animationSpeed: number;

  private _mainlineStepper: LineStepper = new LineStepper();
  private _lineSteppers: LineStepper[] = [];
  private _lineSteppersCount: number = 0;

  private _bones: SpriterBone[] = [];
  private _objects: SpriterObject[] = [];
  private _tags: number = 0;  // up to 32 tags - 1 per bit
  private _vars: Variable[] = [];

  private _charMapStack: CharMapStack;

  private _time: number;

  private _root: SpatialInfo;

  private _paused: boolean = false;
  private _finished: boolean;
  private _isLooping: boolean = false;

  // -------------------------------------------------------------------------
  constructor(options: SpriterContainerOptions) {
    super(options.scene);

    this._spriter = options.animation;
    this._entityName = options.defaultCharacter;
    this._entity = options.animation.getEntityByName(options.defaultCharacter);
    this._textureKey = options.atlasKey;

    this._root = new SpatialInfo();

    // clone variables
    for (var i = 0; i < this._entity.variablesLength; i++) {
      this._vars[i] = this._entity.getVariableById(i).clone();
    }

    // create charmap stack
    this._charMapStack = new CharMapStack(this._entity);

    this.setAnimationSpeedPercent(100);

    this.playAnimation({
      animationName: options.defaultAnimationName,
      loop: true,
    });
  }

  // -------------------------------------------------------------------------
  public get spriter(): Spriter {
    return this._spriter;
  }

  // -------------------------------------------------------------------------
  public get entity(): Entity {
    return this._entity;
  }

  // -------------------------------------------------------------------------
  public get charMapStack(): CharMapStack {
    return this._charMapStack;
  }

  // -------------------------------------------------------------------------
  public get paused(): boolean {
    return this._paused;
  }

  // -------------------------------------------------------------------------
  public set paused(paused: boolean) {
    this._paused = paused;
  }

  // -------------------------------------------------------------------------
  public get animationsCount(): number {
    return this._entity.animationsLength;
  }

  // -------------------------------------------------------------------------
  public get currentAnimationName(): string {
    return this._animationName;
  }

  // -------------------------------------------------------------------------
  public pushCharMap(charMapName: string): void {
    this._charMapStack.push(charMapName);
    this.resetSprites();
  }

  // -------------------------------------------------------------------------
  public removeCharMap(charMapName: string): void {
    this._charMapStack.remove(charMapName);
    this.resetSprites();
  }

  // -------------------------------------------------------------------------
  public clearCharMaps(): void {
    this._charMapStack.reset();
    this.resetSprites();
  }

  // -------------------------------------------------------------------------
  private resetSprites(): void {
    for (var i = 0; i < this._objects.length; i++) {
      this._objects[i].resetFile();
    }
  }

  // -------------------------------------------------------------------------
  public isTagOn(tagName: string): boolean {
    return this.isTagOnById(this._spriter.getTagByName(tagName).id);
  }

  // -------------------------------------------------------------------------
  public isTagOnById(tagId: number): boolean {
    return (this._tags & (1 << tagId)) > 0;
  }

  // -------------------------------------------------------------------------
  public getVariable(varName: string): Variable {
    return this.getVariableById(this._entity.getVariableByName(varName).id);
  }

  // -------------------------------------------------------------------------
  public getVariableById(varId: number): Variable {
    return this._vars[varId];
  }

  // -------------------------------------------------------------------------
  public getObject(objectName: string): SpriterObject {
    for (var i = 0; i < this._objects.length; i++) {
      var object = this._objects[i];

      if (object.name === objectName) {
        return object;
      }
    }

    // @ts-ignore
    return null;
  }

  // -------------------------------------------------------------------------
  public setAnimationSpeedPercent(animationSpeedPercent: number = 100): void {
    this._animationSpeed = animationSpeedPercent / 100;
  }


  public changeEntity(animation: Spriter, entityName: string): void {
    this._entity = animation.getEntityByName(entityName);

    this.playAnimation({
      animationName: this._animationName,
      loop: true,
    });
  }

  public playAnimation({animationName, loop = false}: {
    animationName: string,
    loop?: boolean,
  }): void {
    const animation = this._entity.getAnimationByName(animationName);

    this._animationName = animation.name;
    this._animation = animation;

    this._finished = false;
    this._isLooping = loop;

    // reset time to beginning of animation and find first from and to keys
    this._mainlineStepper.reset();
    this._mainlineStepper.line = this._animation.mainline;
    this._time = 0;

    // reset all additional time lines (soundline, varline, tagline, eventline)
    this.resetLines();

    // reset tags
    this._tags = 0;

    // reset variables to defaults
    for (var i = 0; i < this._vars.length; i++) {
      this._vars[i].reset();
    }

    // create bones and sprites - based on data in mainLine key 0
    this.loadKeys(<KeyMainline>this._animation.mainline.at(0), true);
    // first update - to set correct positions
    this.updateCharacter();
  }

  // -------------------------------------------------------------------------
  private resetLines(): void {
    // reset steppers
    this._lineSteppersCount = 0;

    // go through all lines (sounds, events, tags, vars)
    for (var i = 0; i < this._animation.linesLength; i++) {
      var line = this._animation.getLineById(i);

      // if not enough line steppers in array, add new one
      if (this._lineSteppersCount >= this._lineSteppers.length) {
        this._lineSteppers[this._lineSteppersCount] = new LineStepper();
      }

      // get free stepper
      var stepper = this._lineSteppers[this._lineSteppersCount++];
      stepper.reset();
      stepper.line = line;
    }
  }

  // -------------------------------------------------------------------------
  private setBones(bones: Ref[], force: boolean = false): void {
    // switch off all existing bones
    for (var i = 0; i < this._bones.length; i++) {
      if (this._bones[i] !== undefined) {
        this._bones[i].setOn(false);
      }
    }

    // go through all bones and add new ones if necessary and activate used ones
    for (var i = 0; i < bones.length; i++) {
      var ref = bones[i];

      // if bone does not exist add it and make active, else make it active only
      if (this._bones[ref.id] === undefined) {
        var newBone = new SpriterBone();
        newBone.type = eObjectType.BONE;
        this._bones[ref.id] = newBone;
      }

      var bone = this._bones[ref.id];

      bone.setOn(true);
      bone.parent = ref.parent;

      if (bone.timelineKey !== ref.key || bone.timeline !== ref.timeline || force) {
        bone.setKey(this._entity, this._animation, ref.timeline, ref.key);
      }
    }
  }

  // -------------------------------------------------------------------------
  private setObjects(objects: Ref[], force: boolean = false): void {
    // switch off (kill) all existing sprites
    for (var i = 0; i < this._objects.length; i++) {
      if (this._objects[i] !== undefined) {
        this._objects[i].setOn(false);
      }
    }

    // go through all objects/sprites and add new ones if necessary and activate used ones
    var zChange = false;
    for (var i = 0; i < objects.length; i++) {
      var ref = objects[i];

      // @ts-ignore
      var object: SpriterObject = null;
      // @ts-ignore
      var sprite: Phaser.GameObjects.Sprite = null;

      // if sprite does not exist add it and make active, else make it active only
      if (this._objects[ref.id] === undefined) {
        sprite = new Phaser.GameObjects.Sprite(this.scene, 0, 0, this._textureKey);
        object = new SpriterObject(this, sprite);
        this._objects[ref.id] = object;
        this.add(sprite);
      } else {
        object = this._objects[ref.id];
        sprite = object.sprite;
      }

      object.parent = ref.parent;
      object.type = this._animation.getTimelineById(ref.timeline).objectType;

      // is it sprite or any other type of object? (box / point)
      if (object.type === eObjectType.SPRITE) {
        object.setOn(true);

        if (object.sprite.z !== ref.z) {
          object.sprite.z = ref.z;
          zChange = true;
        }
      } else {
        object.setOn(true, true);
      }


      if (object.timelineKey !== ref.key || object.timeline !== ref.timeline || force) {
        object.setKey(this._entity, this._animation, ref.timeline, ref.key);
      }
    }

    // need to sort sprites?
    if (zChange) {
      this._objects.sort();
    }
  }

  // -------------------------------------------------------------------------
  private loadKeys(keyMainline: KeyMainline, force: boolean = false): void {
    this.setBones(keyMainline.boneRefs, force);
    this.setObjects(keyMainline.objectRefs, force);
  }

  // -------------------------------------------------------------------------
  public updateAnimation(): void {
    if (this._paused || this._finished) {
      return;
    }

    var mainlineStepper = this._mainlineStepper;

    // check if in the end of animation and whether to loop or not
    if (this._time >= this._animation.length) {
      if (this._isLooping) {
        this._time -= this._animation.length;

        this.onLoop.emit("ON_LOOP");
      } else {
        this._time = this._animation.length;
        this._finished = true;

        this.onFinish.emit("ON_FINISH");

        return;
      }
    }


    // consume all new keys
    var key: KeyMainline;
    while ((key = <KeyMainline>mainlineStepper.step(this._time)) !== null) {
      this.loadKeys(key);
      mainlineStepper.lastTime = key.time;
    }

    this.updateCharacter();
    this.updateLines();

    // TODO slow FPS is not supported yet
    this._time += this.scene.time.timeScale * 16 * this._animationSpeed;
  }

  // -------------------------------------------------------------------------
  private updateCharacter(): void {

    for (var i = 0; i < this._bones.length; i++) {
      var bone = this._bones[i];
      if (bone.on) {
        var parentSpatial = (bone.parent === -1) ? this._root : this._bones[bone.parent].transformed;

        bone.tween(this._time);
        bone.update(parentSpatial);
      }
    }

    for (var i = 0; i < this._objects.length; i++) {
      var object = this._objects[i];
      if (object.on) {
        var parentSpatial = (object.parent === -1) ? this._root : this._bones[object.parent].transformed;

        object.tween(this._time);
        object.update(parentSpatial);

        if (object.type === eObjectType.SPRITE) {
          object.updateSprite();
        } else if (object.type === eObjectType.BOX) {
          this.onBoxUpdated.emit(this, object);
        } else if (object.type === eObjectType.POINT) {
          this.onPointUpdated.emit(this, object);
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  private updateLines(): void {
    for (var i = this._lineSteppersCount - 1; i >= 0; i--) {
      var lineStepper = this._lineSteppers[i];
      var line = lineStepper.line;
      var key: Key;

      while ((key = lineStepper.step(this._time)) !== null) {
        switch (line.type) {
          case eTimelineType.SOUND_LINE:
            //console.log("sound: " + line.name + " - key: " + key.id + ", time: " + key.time);
            this.onSound.emit(this, line.name);
            break;

          case eTimelineType.EVENT_LINE:
            //console.log("event: " + line.name + " - key: " + key.id + ", time: " + key.time);
            this.onEvent.emit(this, line.name);
            break;

          case eTimelineType.TAG_LINE:
            var tagsOn = (<KeyTag>key).tagsOn;
            var tagChanges = this._tags ^ tagsOn;
            this._tags = tagsOn;
            // go through all changes
            for (var j = 0; j < this._spriter.tagsLength; j++) {
              var mask = 1 << j;
              if (tagChanges & mask) {
                //console.log("tag change: " + this._spriter.getTagById(j).name + " value: " + ((tagsOn & mask) > 0) + " - key: " + key.id + ", time: " + key.time);
                this.onTagChange.emit(this, this._spriter.getTagById(j).name, (tagsOn & mask) > 0);
              }
            }
            break;

          case eTimelineType.VAR_LINE:
            var newVal = (<KeyVariable>key).value;
            var variable = this._vars[(<Varline>line).varDefId];
            variable.value = newVal;
            //console.log("var set: " + variable.name + " value: " + variable.value + " - key: " + key.id + ", time: " + key.time);
            this.onVariableSet.emit(this, variable)
            break;
        }

        lineStepper.lastTime = key.time;
      }
    }
  }
}
