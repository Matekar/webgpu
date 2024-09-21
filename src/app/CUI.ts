class CommandNode {
  private _name: string;
  private _description: string;
  private _invokeBy: string;
  private _commandKey: string;
  private _children: Array<CommandNode>;

  constructor(
    invokeBy: string,
    commandKey: string,
    name: string = "",
    description: string = ""
  ) {
    this._name = name;
    this._description = description;

    this._invokeBy = invokeBy;
    this._commandKey = commandKey;
    this._children = new Array();
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

  public get children(): Array<CommandNode> {
    return this._children;
  }
}

class CUI {
  private _areShortCommandsEnabled: boolean;

  private _commands: Map<string, Function>;
  private _mainRoot: CommandNode;
  private _subRoots: Array<CommandNode>;

  private _eventStack: string[];

  constructor(mainInvoke: string, areEnabledOnStart: boolean = true) {
    this._areShortCommandsEnabled = areEnabledOnStart;

    this._commands = new Map();
    this._commands.set("", this.invokeCommand);

    this._mainRoot = new CommandNode(mainInvoke, "");
    this._subRoots = new Array();

    this._eventStack = [];
    this.populateStack();
  }

  private populateStack(branch: Array<CommandNode> = this._subRoots) {
    this._eventStack = [this._mainRoot.invoker];

    if (this._areShortCommandsEnabled) {
      branch.forEach((node) => this._eventStack.push(node.invoker));
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

export const cCUI = new CUI(":");
export default cCUI;

export const keyMap = new Map<string, boolean>();
