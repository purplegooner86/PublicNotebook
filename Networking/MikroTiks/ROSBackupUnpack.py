#!/usr/bin/env python3

# RouterOS Backup Tools by BigNerd95

import sys, os, struct
from argparse import ArgumentParser, FileType

# RouterOS constants
MAGIC_ENCRYPTED_RC4 = 0x7291A8EF
MAGIC_ENCRYPTED_AES = 0X7391A8EF   
MAGIC_PLAINTEXT = 0xB1A1AC88
RC4_SKIP = 0x300
AES_SKIP = 0x10

#####################
# support functions #
#####################

def get_header(input_file):
    input_file.seek(0, 0)
    data = input_file.read(8)
    header = struct.unpack('<II', data)
    return header[0], header[1]

def get_salt(input_file):
    input_file.seek(8, 0)
    return input_file.read(32)

def get_signature(input_file):
    input_file.seek(40, 0)
    return input_file.read(32)

def extract_data(input_file):
    raw_len = input_file.read(4)
    if len(raw_len) != 4:
        raise EOFError('EOF')
    data_len = struct.unpack('<I', raw_len)[0]

    raw_data = input_file.read(data_len)
    if len(raw_data) != data_len:
        raise EOFError('EOF')
    return raw_data

def create_write_file(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(data)

def get_file_list(path):
    file_list = []

    original_path = os.getcwd()
    os.chdir(path)
    for root, dirs, files in os.walk("."):
        file_path = root.split(os.sep)[1:]
        file_path = '/'.join(file_path)
        if file_path:
            file_path += '/'
        for file in files:
            # check if both idx and dat files exist
            if file.endswith(".idx") and file[:-3] + "dat" in files:
                file_list.append(file_path + file[:-4])
    os.chdir(original_path)

    return file_list

def write_data(output_file, data):
    data_len = struct.pack('<I', len(data))
    output_file.write(data_len)
    output_file.write(data)

##################
# core functions #
##################



def unpack_files(input_file, file_length, path):
    count = 0
    input_file.seek(8, 0) # skip magic, length

    path = os.path.join(path, '')
    if os.path.exists(path):
        print("Directory", os.path.basename(path) , "already exists, cannot extract!")
        return count

    while input_file.tell() < file_length:
        try:
            name = extract_data(input_file).decode('ascii')
            idx = extract_data(input_file)
            dat = extract_data(input_file)

            create_write_file(path + name + '.idx', idx)
            create_write_file(path + name + '.dat', dat)

            count += 1
        except EOFError:
            print("Unexpected End of File!")
            break
    return count

def pack_files(path, file_names, output_file):
    output_file.seek(0, 0)
    magic = struct.pack('<I', MAGIC_PLAINTEXT)
    output_file.write(magic + bytes(4)) # magic, length offset

    path = os.path.join(path, '')
    for name in file_names:
        with open(path + name + '.idx', "rb") as idx_file:
            idx = idx_file.read()
        with open(path + name + '.dat', "rb") as dat_file:
            dat = dat_file.read()

        write_data(output_file, name.encode('ascii'))
        write_data(output_file, idx)
        write_data(output_file, dat)

    length = struct.pack('<I', output_file.tell()) # length
    output_file.seek(4, 0)
    output_file.write(length)


##################
# main functions #
##################

def info(input_file):
    print('** Backup Info **')
    magic, length = get_header(input_file)

    if magic == MAGIC_ENCRYPTED_RC4:
        print("RouterOS Encrypted Backup (rc4-sha1)")
        print("Length:", length, "bytes")
        salt = get_salt(input_file)
        print("Salt (hex):", salt.hex())
        magic_check = get_magic_check_rc4(input_file)
        print("Magic Check (hex):", magic_check.hex())

    elif magic == MAGIC_ENCRYPTED_AES:
        print("RouterOS Encrypted Backup (aes128-ctr-sha256)")
        print("Length:", length, "bytes")
        salt = get_salt(input_file)
        print("Salt (hex):", salt.hex())
        signature = get_signature(input_file)
        print("Signature: ", signature.hex())
        magic_check = get_magic_check_aes(input_file)
        print("Magic Check (hex):", magic_check.hex())

    elif magic == MAGIC_PLAINTEXT:
        print("RouterOS Plaintext Backup")
        print("Length:", length, "bytes")

    else:
        print("Invalid file!")

    input_file.close()


def unpack(input_file, unpack_directory):
        print('** Unpack Backup **')
        magic, length = get_header(input_file)

        if magic in (MAGIC_ENCRYPTED_RC4, MAGIC_ENCRYPTED_AES):
            print("RouterOS Encrypted Backup")
            print("Cannot unpack encrypted backup!")
            print("Decrypt backup first!")

        elif magic == MAGIC_PLAINTEXT:
            print("RouterOS Plaintext Backup")
            print("Length:", length, "bytes")

            print("Extracting backup...")
            files_num = unpack_files(input_file, length, unpack_directory)
            if files_num > 0:
                print("Wrote", files_num, "files pair in:", unpack_directory)

        else:
            print("Invalid file!")
            print("Cannot unpack!")

        input_file.close()

def pack(output_file, pack_directory):
        print('** Pack Backup **')

        file_names = get_file_list(pack_directory)
        if len(file_names) > 0:
            print("Creating plaintext backup with", len(file_names), "files pair...")
            pack_files(pack_directory, file_names, output_file)
            print("Done!")
        else:
            print("Error! No IDX and DAT files found!")

        output_file.close()


def parse_cli():
    parser = ArgumentParser(description='** RouterOS Backup Tools by BigNerd95 **')
    subparser = parser.add_subparsers(dest='subparser_name')

    infoParser = subparser.add_parser('info', help='Backup info')
    infoParser.add_argument('-i', '--input', required=True, metavar='INPUT_FILE', type=FileType('rb'))

    unpackParser = subparser.add_parser('unpack', help='Unpack backup')
    unpackParser.add_argument('-i', '--input', required=True, metavar='INPUT_FILE', type=FileType('rb'))
    unpackParser.add_argument('-d', '--directory', required=True, metavar='UNPACK_DIRECTORY')

    packParser = subparser.add_parser('pack', help='Pack backup')
    packParser.add_argument('-d', '--directory', required=True, metavar='PACK_DIRECTORY')
    packParser.add_argument('-o', '--output', required=True, metavar='OUTPUT_FILE', type=FileType('xb'))

    if len(sys.argv) < 2:
        parser.print_help()

    return parser.parse_args()

def main():
    args = parse_cli()
    if args.subparser_name == 'info':
        info(args.input)
    elif args.subparser_name == 'unpack':
        unpack(args.input, args.directory)
    elif args.subparser_name == 'pack':
        pack(args.output, args.directory)

if __name__ == '__main__':
    main()