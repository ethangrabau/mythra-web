import json

def print_tree(data, indent=0):
    for key, value in data.items():
        print(' ' * indent + str(key))
        if isinstance(value, dict):
            print_tree(value, indent + 4)
        elif isinstance(value, list):
            for item in value:
                if isinstance(item, dict):
                    print_tree(item, indent + 4)
                else:
                    print(' ' * (indent + 4) + str(item))
        else:
            print(' ' * (indent + 4) + str(value))

def main():
    with open('session-1730890313262.json', 'r') as file:
        data = json.load(file)
        print_tree(data)

if __name__ == "__main__":
    main()