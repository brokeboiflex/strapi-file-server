import colors from 'colors/safe';

interface LogOptions {
  (
    text: any,
    color?:
      | 'black'
      | 'red'
      | 'green'
      | 'yellow'
      | 'blue'
      | 'magenta'
      | 'cyan'
      | 'white'
      | 'gray'
      | 'grey'
      | 'brightRed'
      | 'brightGreen'
      | 'brightYellow'
      | 'brightBlue'
      | 'brightMagenta'
      | 'brightCyan'
      | 'brightWhite',
    style?:
      | 'reset'
      | 'bold'
      | 'dim'
      | 'italic'
      | 'underline'
      | 'inverse'
      | 'hidden'
      | 'strikethrough',
    sameLine?: boolean
  ): void;
}

const log: LogOptions = function (text: any, color: string, style: string) {
  if (color && style) {
    process.stdout.write('\n' + colors[color][style](text));
  } else if (color && !style) {
    process.stdout.write('\n' + colors[color](text));
  } else if (!color && style) {
    process.stdout.write('\n' + colors[style](text));
  } else if (!color && !style) {
    process.stdout.write('\n' + text);
  }
};
export const singleLinelog: LogOptions = function (
  text: any,
  color: string,
  style: string,
  sameLine: boolean
) {
  if (color && style) {
    process.stdout.write(colors[color][style](text));
  } else if (color && !style) {
    process.stdout.write(colors[color](text));
  } else if (!color && style) {
    process.stdout.write(colors[style](text));
  } else if (!color && !style) {
    process.stdout.write(text);
  }
};
export default log;
