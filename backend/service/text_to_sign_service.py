import random
import string
import urllib.error
import urllib.parse
import urllib.request


# generate random file name
def generate_file_name():
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=10)) + ".pose"


def text_to_sign(text: str):
    base_url = 'https://us-central1-sign-mt.cloudfunctions.net/spoken_text_to_signed_pose'

    params = {
        'text': text,
        'spoken': 'en',
        'signed': 'ase'
    }

    try:
        query_string = urllib.parse.urlencode(params)
        full_url = f"{base_url}?{query_string}"
        file_name = "data/" + generate_file_name()

        with urllib.request.urlopen(full_url) as response:
            data = response.read()
            with open(file_name, "wb") as f:
                f.write(data)
        return file_name

    except urllib.error.HTTPError as e:
        print(f"HTTP error: {e.code} {e.reason}")
    except urllib.error.URLError as e:
        print(f"Network error: {e.reason}")
    except Exception as e:
        print(f"An error occurred: {e}")
