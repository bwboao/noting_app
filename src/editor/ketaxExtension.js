import katex from "katex";
import { Node,
    callOrReturn,
    InputRule,
    mergeAttributes} from '@tiptap/core'
import 'katex/dist/katex.min.css'

// for ketax to html
//https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}
const inputRegex = /(?:^|\s)((?:\$)((?:[^`]+))(?:\$))$/
const KatexExtension = Node.create({
    name: 'katexExtension',
    addOptions(){
        return {
            HTMLAttributes: {}
        }
    },
    group: 'inline',
    inline: true,
    // content: "text*",
    atom: true,
    selectable: false,
    parseHTML() {
        console.log("sth happens?",this)
        return [
            {
                tag: 'katex' ,
                getAttrs: element =>{
                    element.getAttribute('katex-input')
                }
            
            },
        ]
    },
    addAttributes(){
        return{
            input: {
                default: null,
                parseHTML: element => {
                    // console.log("parsing",element);
                    element.getAttribute('katex-input')
                    // return element.outerText;
                    // return element.style
                },
                // renderHTML: attributes => {
                //     if (!attributes.id) {
                //       return {}
                //     }
                //     return {
                //       'data-id': attributes.id,
                //     }
                //   },
            },
            parsedHTML: {
                default: null
            }
        }
    },
    renderText({node}){
        return node.attrs.input
    },
    renderHTML({ node, HTMLAttributes}) {
        console.log("sth happens?",node, HTMLAttributes);
        return [ 'katex', 
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
            // HTMLAttributes,
            "renderedkatex",
        ]
    },
    addKeyboardShortcuts(){
        return{
            // from mention.ts
            Backspace: ()=> this.editor.commands.command(({tr, state})=>{
                let isKatex = false
                const { selection } = state
                const { empty, anchor } = selection

                if(!empty){
                    return false;
                }

                state.doc.nodesBetween(anchor - 1, anchor, (node, pos) => {
                    if (node.type.name === this.name) {
                      isKatex = true
                    //   console.log(node.attrs)
                      tr.insertText(node.attrs.input || '', pos, pos + node.nodeSize)
          
                      return false
                    }
                })
                return isKatex
            }),
        }
    },
    addNodeView() {
        return ({node, editor}) => {
            // console.log("addnodeview",node);
            console.log(node.attrs)
            const container = document.createElement('katex')        
            const content = htmlToElement(node.attrs.parsedHTML)
            // console.log(content)
            container.append(content)
            container.setAttribute("katex-input",node.attrs.input);
            container.setAttribute("katex-parsedHTML",node.attrs.parseHTML);

            return {
                dom: container,
                // contentDOM: content,
                // ignoreMutation: true,
                update: updatedNode => {
                    console.log(updatedNode);
                    console.log(updatedNode.type,this.type)
                    if(updatedNode.type !== this.type){
                        console.log(false)
                        return false;
                    }

                    return false;
                },
                stopEvent: event =>{
                    return true;
                }
            }
        }
      },

    addInputRules(){
        console.log("this.type",this.type,this)
        return[
            // wrappingInputRule({
            //     find: inputRegex,
            //     type: this.type,
            // }),
            new InputRule({
                find: inputRegex,
                // type: this.type,
                handler: ({state, range, match}) =>{
                    const attributes = callOrReturn(false,undefined,match) || {}
                    const { tr } = state;
                    const captureGroup = match[match.length - 1];
                    const fullMatch = match[0];

                    console.log("input testing",state,range,match);

                    let parsedContent = katex.renderToString(match[2],{
                        throwOnError: false
                    });
                    let parsedHTML = htmlToElement(parsedContent);
                    console.log(parsedContent,parsedHTML)
                    // tr.insertText(parsedContent,range.from,range.to)
                    const parsedNode = this.type.create({input: match[1], parsedHTML: parsedContent})
                    console.log(parsedNode,this.type.create())
                    // tr.replace(range.from, range.to, parsedNode)
                    if(match[0].length > match[1].length){
                        //ignore the blankspace, don't replace them
                        tr.replaceWith(range.from+1, range.to,parsedNode);
                    }else{
                        tr.replaceWith(range.from, range.to, parsedNode);
                    }
                }
            })
        ]
    },

})

export default KatexExtension;