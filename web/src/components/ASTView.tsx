interface ASTViewProps {
  ast: any; // FunctionAST from either WASM JSON or TS
}

function renderNode(node: any, depth: number = 0): JSX.Element {
  if (!node || typeof node !== 'object') return <></>;

  const type = node.type || 'Unknown';
  let label = '';
  let valueStr = '';
  let children: JSX.Element[] = [];

  switch (type) {
    case 'FunctionAST':
      label = `Function`;
      valueStr = node.name || '';
      if (node.body) {
        children = node.body.map((s: any, i: number) => (
          <div key={i}>{renderNode(s, depth + 1)}</div>
        ));
      }
      break;

    case 'VarDecl':
      label = 'VarDecl';
      valueStr = node.name || '';
      if (node.init) children.push(<div key="init">{renderNode(node.init, depth + 1)}</div>);
      break;

    case 'Assignment':
      label = 'Assign';
      valueStr = node.name || '';
      if (node.value) children.push(<div key="val">{renderNode(node.value, depth + 1)}</div>);
      break;

    case 'ArrayDecl':
      label = 'ArrayDecl';
      valueStr = `${node.name}[${node.size}]`;
      break;

    case 'ArrayAssignment':
      label = 'ArrayAssign';
      valueStr = node.name || '';
      if (node.index) children.push(<div key="idx">{renderNode(node.index, depth + 1)}</div>);
      if (node.value) children.push(<div key="val">{renderNode(node.value, depth + 1)}</div>);
      break;

    case 'ReturnStmt':
      label = 'Return';
      if (node.value) children.push(<div key="val">{renderNode(node.value, depth + 1)}</div>);
      break;

    case 'WhileStmt':
      label = 'While';
      if (node.condition) children.push(
        <div key="cond">
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>condition:</span>
          {renderNode(node.condition, depth + 1)}
        </div>
      );
      if (node.body) {
        children.push(
          <div key="body">
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>body:</span>
            {node.body.map((s: any, i: number) => (
              <div key={i}>{renderNode(s, depth + 1)}</div>
            ))}
          </div>
        );
      }
      break;

    case 'PrintStmt':
      label = 'Print';
      if (node.value) children.push(<div key="val">{renderNode(node.value, depth + 1)}</div>);
      break;

    case 'NumberExpr':
      label = 'Number';
      valueStr = String(node.value);
      break;

    case 'VariableExpr':
      label = 'Var';
      valueStr = node.name || '';
      break;

    case 'BinaryExpr':
      label = 'BinOp';
      valueStr = node.op || '';
      if (node.left) children.push(<div key="l">{renderNode(node.left, depth + 1)}</div>);
      if (node.right) children.push(<div key="r">{renderNode(node.right, depth + 1)}</div>);
      break;

    case 'ArrayAccessExpr':
      label = 'ArrayAccess';
      valueStr = node.name || '';
      if (node.index) children.push(<div key="idx">{renderNode(node.index, depth + 1)}</div>);
      break;

    default:
      label = type;
  }

  const isExpr = ['NumberExpr', 'VariableExpr', 'BinaryExpr', 'ArrayAccessExpr'].includes(type);
  const isControl = ['WhileStmt'].includes(type);

  return (
    <div className="ast-node">
      <div className="ast-node-label">
        <span className="ast-node-type" style={{
          color: isControl ? 'var(--accent-amber)' : isExpr ? 'var(--accent-cyan)' : 'var(--accent-violet)'
        }}>
          {label}
        </span>
        {valueStr && (
          <span className={type === 'BinaryExpr' ? 'ast-node-op' : 'ast-node-value'}>
            {valueStr}
          </span>
        )}
      </div>
      {children.length > 0 && <div>{children}</div>}
    </div>
  );
}

export default function ASTView({ ast }: ASTViewProps) {
  return (
    <>
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-title-icon">🌳</span>
          Parser Output — Abstract Syntax Tree
        </div>
      </div>
      <div className="panel-body">
        <div className="ast-tree">
          {renderNode(ast)}
        </div>
      </div>
    </>
  );
}
