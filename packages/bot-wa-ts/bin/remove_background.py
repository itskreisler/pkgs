from rembg import remove, new_session
from PIL import Image
from argparse import ArgumentParser

modelos = ['u2net', 'u2netp','u2net_human_seg','u2net_cloth_seg','silueta','isnet-general-use','isnet-anime','sam']

def remove_bg(input_path, output_path,model):
    """
    Remove background from image

    Args:
        input_path (str): input image file
        output_path (str): output image file
        model (str): model name
    
    Returns:
        None
    """
    input = Image.open(input_path)
    output = remove(input, session=new_session(model_name=model))
    output.save(output_path)

if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument("-i", "--input", dest="inputFile",
                        help="input file", metavar="INPUT")
    parser.add_argument("-o", "--output", dest="outputFile",
                        help="output file", metavar="OUTPUT")
    parser.add_argument("-m", "--model", dest="model",
                        help="model name", metavar="MODEL")
    args = parser.parse_args()
    # print(args)
    if args.inputFile is None or args.outputFile is None or args.model is None:
        parser.print_help()
        exit(1)
    if args.model not in modelos:
        print(f"Modelo no soportado, modelos soportados: {modelos}")
        print("Ejemplo: python remove_background.py -i input.png -o output.png -m u2net")
        print("Detalles de los modelos en https://pypi.org/project/rembg/")
        exit(1)        
    remove_bg(args.inputFile, args.outputFile,args.model)