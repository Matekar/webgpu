class CommandNode {
  private _id: number;

  private _name: string;
  private _description: string;
  private _invokeBy: string;
  private _commandKey: string;
  private _children: Array<CommandNode>;

  constructor(
    id: number,
    invokeBy: string,
    commandKey: string,
    name: string = "",
    description: string = ""
  ) {
    this._id = id;

    this._name = name;
    this._description = description;

    this._invokeBy = invokeBy;
    this._commandKey = commandKey;
    this._children = new Array();
  }

  public get ID(): number {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get description(): string {
    return this._description;
  }

  public get invoker(): string {
    return this._invokeBy;
  }

  public get commandKey(): string {
    return this._commandKey;
  }

  public get children(): Array<CommandNode> {
    return this._children;
  }

  public searchIn(id: number): CommandNode | undefined {
    if (this._id == id) return this;
    if (this._children.length == 0) return undefined;

    return this._children.find((child) => child.searchIn(id));
  }
}

class CUI {
  private _areShortCommandsEnabled: boolean;

  private _commands: Map<string, Function>;
  private _mainRoot: CommandNode;
  private _subRoots: Array<CommandNode>;
  private _currentSubRoot: number;

  private _invokeStack!: Map<string, number>;

  constructor(mainInvoke: string, areEnabledOnStart: boolean = true) {
    this._areShortCommandsEnabled = areEnabledOnStart;

    this._commands = new Map();
    this._commands.set("", this.invokeCommand);

    this._mainRoot = new CommandNode(0, mainInvoke, "");
    this._subRoots = new Array();
    this._currentSubRoot = 0;

    this._populateStack();

    document.addEventListener("keydown", (event) => this._handleKeydown(event));
    document.addEventListener("keyup", (event) => this._handleKeyup(event));
  }

  private _handleKeydown(ev: KeyboardEvent) {
    keyMap.set(ev.code, true);

    if (this._invokeStack.get(ev.key)) {
      this._populateStack(
        this._subRoots[this._currentSubRoot].searchIn(
          this._invokeStack.get(ev.key)!
        )!.children
      );
      return;
    }
  }

  private _handleKeyup(ev: KeyboardEvent) {
    keyMap.set(ev.code, false);
  }

  private _populateStack(
    branch: Array<CommandNode> = [this._subRoots[this._currentSubRoot]]
  ) {
    this._invokeStack = new Map();
    this._invokeStack.set(this._mainRoot.invoker, this._mainRoot.ID);

    if (this._areShortCommandsEnabled) {
      branch.forEach((node) => this._invokeStack.set(node.invoker, node.ID));
    }
  }

  public registerCommand(commandKey: string, command: Function) {
    if (commandKey != "") this._commands.set(commandKey, command);
  }

  public invokeCommand(commandKey: string, ...args: any[]) {
    if (this._commands.get(commandKey))
      this._commands.get(commandKey)!.call(args);
  }
}

const keyMap = new Map<string, boolean>();

export const cCUI = new CUI(":");
export default cCUI;
