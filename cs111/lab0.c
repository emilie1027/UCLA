#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <signal.h>
#include <errno.h>
#include <string.h>

#define BUF_SIZE 8192

void unix_error(char *msg) /* Unix-style error */
{
    perror(msg);
}


void signal_handler(int signum) {
    signal(SIGSEGV, signal_handler);
    fprintf(stderr, "Caught SIGSEGV\n");
    exit(3);
}

int main(int argc, char *argv[]) {
    char input [BUF_SIZE];
    char output [BUF_SIZE];
    int segfault = 0;
    int catch = 0;
    int i;
    for (i = 1; i < argc; i++) {
        int length;
        if (strstr(argv[i], "--input=") != NULL) {
            length = strlen(argv[i]) - strlen("--input=");
            memcpy(input, argv[i] + strlen("--input="), length);
            input[length] =  '\0';
        }
        else if (strstr(argv[i], "--output=") != NULL) {
            length = strlen(argv[i]) - strlen("--output=");
            memcpy (output, argv[i] + strlen("--output="), length);
            output[length] =  '\0';
        }
        else if (strcmp(argv[i], "--segfault") == 0)
            segfault = 1;
        else if (strcmp(argv[i], "--catch") == 0)
            catch = 1;
    }
    
    int fd0, fd1;
    char *buffer;
    
    if ((fd0 = open(input, O_RDONLY)) < 0) {
        unix_error("failed to open input");
        exit(1);
    }
    if ((fd1 = creat(output, 0666)) < 0) {
        unix_error("failed to open output");
        exit(2);
    }
    if (segfault) {
        buffer = (void *)-1;
    }
    else {
        buffer = malloc(BUF_SIZE);
    }
    if (catch) {
        signal(SIGSEGV, signal_handler);
    }
    int n;
    while((n = read(fd0, buffer, BUF_SIZE)) > 0) {
        write(fd1, buffer, n); 
    }
    close(fd0);
    close(fd1);
    free(buffer);
    exit(0);
}


