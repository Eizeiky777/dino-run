import Phaser from "phaser";


// ===== METHOD 1: Declaration Merging (Recommended) to modify built in Phaser GameObjects =====

// Create a types file: types/phaser-extensions.d.ts
// declare namespace Phaser.GameObjects {
//     interface GameObjectFactory {
//         customObject(x: number, y: number, text?: string, color?: number): CustomGameObject;
//         customButton(x: number, y: number, text: string, callback?: () => void): CustomButton;
//         uiPanel(x: number, y: number, width: number, height: number, title: string): Phaser.GameObjects.Container;
//     }
// }

// ===== METHOD 2: Module Augmentation =====

// In a separate .d.ts file or at the top of your main file
// declare module "phaser" {
//     namespace GameObjects {
//         interface GameObjectFactory {
//             customObject(x: number, y: number, text?: string, color?: number): CustomGameObject;
//             customButton(x: number, y: number, text: string, callback?: () => void): CustomButton;
//         }
//     }
// }



// 1. Create your custom game object class (in separate file: CustomGameObject.js)
class CustomGameObject extends Phaser.GameObjects.Container {
  background: any;
  text: any;
  setCustomColor: (color: any) => any;
  bounce: () => any;
  
  constructor(scene, x, y) {
    super(scene, x, y);

    // Create components for your custom object
    this.background = scene.add.rectangle(0, 0, 100, 50, 0x3498db);
    this.text = scene.add
      .text(0, 0, "Custom!", {
        fontSize: "16px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    // Add components to container
    this.add([this.background, this.text]);

    // Add custom methods
    this.setCustomColor = function (color) {
      this.background.setFillStyle(color);
      return this;
    };

    // Custom animation
    this.bounce = function () {
      scene.tweens.add({
        targets: this,
        scaleY: 1.2,
        duration: 200,
        yoyo: true,
      });
      return this;
    };
  }
}

// ===== METHOD 2: Register Factory Extension =====

// Option A: Register in main game file (before creating scenes)
window.addEventListener("load", () => {
  // Register the factory extension BEFORE creating your game
  Phaser.GameObjects.GameObjectFactory.register(
    "customObject",
    function (x, y, text, color) {
      const obj = new CustomGameObject(this.scene, x, y);

      // Optional: customize based on parameters
      if (text) obj.text.setText(text);
      if (color) obj.setCustomColor(color);

      // IMPORTANT: Add to display list and update list
      this.displayList.add(obj);
      this.updateList.add(obj);

      return obj;
    }
  );

  // Now create your Phaser game
  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [GameScene],
  };

  new Phaser.Game(config);
});

// ===== METHOD 3: Register in Scene =====

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  // Option B: Register in scene init (runs before preload)
  init() {
    // Only register once
    if (!Phaser.GameObjects.GameObjectFactory.prototype.customObject) {
      Phaser.GameObjects.GameObjectFactory.register(
        "customObject",
        function (x, y, text, color) {
          const obj = new CustomGameObject(this.scene, x, y);

          if (text) obj.text.setText(text);
          if (color) obj.setCustomColor(color);

          this.displayList.add(obj);
          this.updateList.add(obj);

          return obj;
        }
      );
    }
  }

  create() {
    // Now you can use your custom factory method!
    this.add.customObject(200, 200, "Hello!", 0xe74c3c).setScale(1.5).bounce();

    this.add.customObject(400, 300, "World!", 0x2ecc71);

    // Make them interactive
    this.children.list.forEach((child) => {
      if (child instanceof CustomGameObject) {
        child.setInteractive().on("pointerdown", () => child.bounce());
      }
    });
  }
}

// ===== METHOD 4: Plugin Approach (Most Professional) =====

// Create a plugin file: CustomObjectsPlugin.js
class CustomObjectsPlugin extends Phaser.Plugins.BasePlugin {
  constructor(pluginManager) {
    super(pluginManager);
  }

  init() {
    // Register multiple custom objects
    Phaser.GameObjects.GameObjectFactory.register(
      "customObject",
      function (x, y, text, color) {
        const obj = new CustomGameObject(this.scene, x, y);
        if (text) obj.text.setText(text);
        if (color) obj.setCustomColor(color);
        this.displayList.add(obj);
        this.updateList.add(obj);
        return obj;
      }
    );

    // Register another custom object
    Phaser.GameObjects.GameObjectFactory.register(
      "customButton",
      function (x, y, text, callback) {
        const button = new CustomButton(this.scene, x, y, text);
        button.onClick(callback);
        this.displayList.add(button);
        this.updateList.add(button);
        return button;
      }
    );
  }
}

// Use plugin in game config
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: [GameScene],
  plugins: {
    global: [
      { key: "CustomObjectsPlugin", plugin: CustomObjectsPlugin, start: true },
    ],
  },
};

// ===== COMPLETE EXAMPLE STRUCTURE =====

/*
Project Structure:
/game
  /js
    /objects
      - CustomGameObject.js
      - CustomButton.js
    /plugins
      - CustomObjectsPlugin.js
    /scenes
      - GameScene.js
    - main.js
  - index.html
*/

// ===== ADVANCED: Multiple Custom Objects =====

// Custom Button Class
class CustomButton extends Phaser.GameObjects.Container {
  bg: any;
  label: any;
  constructor(scene, x, y, text) {
    super(scene, x, y);

    this.bg = scene.add.rectangle(0, 0, 120, 40, 0x4caf50);
    this.label = scene.add
      .text(0, 0, text, {
        fontSize: "14px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    this.add([this.bg, this.label]);
    this.setSize(120, 40);
    this.setInteractive();

    // Hover effects
    this.on("pointerover", () => this.bg.setFillStyle(0x45a049));
    this.on("pointerout", () => this.bg.setFillStyle(0x4caf50));
  }

  onClick(callback) {
    this.on("pointerdown", callback);
    return this;
  }
}

// Register multiple factory methods
function registerCustomFactories() {
  Phaser.GameObjects.GameObjectFactory.register(
    "customObject",
    function (x, y, text, color) {
      const obj = new CustomGameObject(this.scene, x, y);
      if (text) obj.text.setText(text);
      if (color) obj.setCustomColor(color);
      this.displayList.add(obj);
      this.updateList.add(obj);
      return obj;
    }
  );

  Phaser.GameObjects.GameObjectFactory.register(
    "customButton",
    function (x, y, text, callback) {
      const button = new CustomButton(this.scene, x, y, text);
      if (callback) button.onClick(callback);
      this.displayList.add(button);
      this.updateList.add(button);
      return button;
    }
  );
}

// Usage in scene:
// this.add.customObject(100, 100, "My Object", 0xff0000);
// this.add.customButton(200, 200, "Click Me", () => console.log("Clicked!"));
